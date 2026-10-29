import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DATA_DIR, readJson, updateJson, uid, writeJson } from "./db";
import { debug } from "./debug";
import type { AiLogEntry, AiSettings } from "./types";

export const AI_DEFAULTS: AiSettings = {
  claudeModel: "claude-sonnet-5-5",
  imageModel: "gpt-image-1",
  imageSize: "1536x1024",
  claudeBaseUrl: "https://api.anthropic.com",
  openaiBaseUrl: "https://api.openai.com",
  claudeKey: "",
  openaiKey: "",
};

export class AiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

/** Ortam değişkeni, panelden girilen anahtarın önüne geçer. */
export async function getAiSettings(): Promise<AiSettings> {
  const stored = await readJson<Partial<AiSettings>>("ai", {});
  const s = { ...AI_DEFAULTS, ...stored };
  if (process.env.ANTHROPIC_API_KEY) s.claudeKey = process.env.ANTHROPIC_API_KEY;
  if (process.env.OPENAI_API_KEY) s.openaiKey = process.env.OPENAI_API_KEY;
  if (process.env.ANTHROPIC_BASE_URL) s.claudeBaseUrl = process.env.ANTHROPIC_BASE_URL;
  if (process.env.OPENAI_BASE_URL) s.openaiBaseUrl = process.env.OPENAI_BASE_URL;
  return s;
}

export async function saveAiSettings(patch: Partial<AiSettings>) {
  // Boş anahtar = "değiştirme"; anahtarı silmek için ayrı bir sinyal gönderilir.
  const current = await readJson<Partial<AiSettings>>("ai", {});
  const next = { ...current };
  for (const [k, v] of Object.entries(patch) as [keyof AiSettings, string][]) {
    if (typeof v !== "string") continue;
    if ((k === "claudeKey" || k === "openaiKey") && v === "") continue;
    next[k] = v === "__clear__" ? "" : v.trim();
  }
  await writeJson("ai", next);
}

export const maskKey = (k: string) => (k ? `${k.slice(0, 6)}…${k.slice(-4)}` : "");

const trimBase = (u: string) => u.replace(/\/+$/, "");

async function logCall(e: Omit<AiLogEntry, "id" | "at">) {
  await updateJson<AiLogEntry[]>("ailog", [], (all) =>
    [{ id: uid(), at: new Date().toISOString(), ...e }, ...all].slice(0, 200),
  );
}

async function timed<T>(provider: AiLogEntry["provider"], action: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  try {
    const r = await fn();
    await logCall({ provider, action, ok: true, ms: Date.now() - t0 });
    debug("ai.ok", { provider, action, ms: Date.now() - t0 });
    return r;
  } catch (err) {
    await logCall({ provider, action, ok: false, ms: Date.now() - t0, error: (err as Error).message.slice(0, 300) });
    debug("ai.fail", { provider, action, ms: Date.now() - t0, error: (err as Error).message.slice(0, 200) });
    throw err;
  }
}

export async function claudeText(action: string, system: string, user: string, maxTokens = 2500): Promise<string> {
  const s = await getAiSettings();
  if (!s.claudeKey) throw new AiError("Claude API anahtarı tanımlı değil (Admin → AI & API).", 400);
  return timed("claude", action, async () => {
    const res = await fetch(`${trimBase(s.claudeBaseUrl)}/v1/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": s.claudeKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: s.claudeModel, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(90_000),
    });
    const body = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[]; error?: { message?: string } };
    if (!res.ok) throw new AiError(`Claude hatası (${res.status}): ${body.error?.message ?? "bilinmeyen"}`, 502);
    const text = body.content?.filter((c) => c.type === "text").map((c) => c.text).join("") ?? "";
    if (!text) throw new AiError("Claude boş yanıt döndü.", 502);
    return text;
  });
}

/** Model yanıtından ilk JSON nesnesini çıkarır (kod bloğu veya açıklama olsa bile). */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new AiError("Yanıtta JSON bulunamadı.", 502);
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiError("Yanıt JSON olarak çözümlenemedi.", 502);
  }
}

export async function claudeJson(action: string, system: string, user: string): Promise<unknown> {
  return extractJson(await claudeText(action, `${system}\n\nSadece geçerli JSON döndür; açıklama veya kod bloğu ekleme.`, user));
}

export async function openaiImage(action: string, prompt: string): Promise<{ name: string }> {
  const s = await getAiSettings();
  if (!s.openaiKey) throw new AiError("OpenAI API anahtarı tanımlı değil (Admin → AI & API).", 400);
  return timed("openai", action, async () => {
    const payload: Record<string, unknown> = { model: s.imageModel, prompt, size: s.imageSize, n: 1 };
    if (s.imageModel.startsWith("dall-e")) payload.response_format = "b64_json";
    const res = await fetch(`${trimBase(s.openaiBaseUrl)}/v1/images/generations`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${s.openaiKey}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(180_000),
    });
    const body = (await res.json().catch(() => ({}))) as { data?: { b64_json?: string; url?: string }[]; error?: { message?: string } };
    if (!res.ok) throw new AiError(`OpenAI hatası (${res.status}): ${body.error?.message ?? "bilinmeyen"}`, 502);
    const item = body.data?.[0];
    let buf: Buffer | null = null;
    if (item?.b64_json) buf = Buffer.from(item.b64_json, "base64");
    else if (item?.url) buf = Buffer.from(await (await fetch(item.url)).arrayBuffer());
    if (!buf) throw new AiError("OpenAI görsel döndürmedi.", 502);
    return { name: await saveUpload(buf, "png") };
  });
}

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

export async function saveUpload(buf: Buffer, ext: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 6)}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return name;
}

export async function getLog() {
  return readJson<AiLogEntry[]>("ailog", []);
}
