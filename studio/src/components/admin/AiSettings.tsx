"use client";
import { useState } from "react";
import type { AiLogEntry } from "@/lib/types";
import { Btn, Card, Field, Toast, api, inputCls, useToast } from "./ui";

type Data = {
  ai: { claudeModel: string; imageModel: string; imageSize: string; claudeBaseUrl: string; openaiBaseUrl: string; claudeKeyMask: string; openaiKeyMask: string };
  envKeys: { claude: boolean; openai: boolean };
};

export function AiSettingsForm({ initial, log: initialLog }: { initial: Data; log: AiLogEntry[] }) {
  const [ai, setAi] = useState(initial.ai);
  const [keys, setKeys] = useState({ claudeKey: "", openaiKey: "" });
  const [log, setLog] = useState(initialLog);
  const [busy, setBusy] = useState("");
  const { msg, show } = useToast();
  const refreshLog = async () => setLog(await api<AiLogEntry[]>("/api/admin/ai/test", "GET"));

  async function save() {
    setBusy("save");
    try {
      const { claudeKeyMask: _a, openaiKeyMask: _b, ...settings } = ai;
      await api("/api/admin/settings", "PUT", { ai: { ...settings, ...Object.fromEntries(Object.entries(keys).filter(([, v]) => v)) } });
      show("ok", "AI ayarları kaydedildi");
      setKeys({ claudeKey: "", openaiKey: "" });
    } catch (e) { show("err", (e as Error).message); }
    setBusy("");
  }
  async function test(provider: "claude" | "openai") {
    setBusy(provider);
    try {
      await save();
      const r = await api<{ detail: string }>("/api/admin/ai/test", "POST", { provider });
      show("ok", `${provider === "claude" ? "Claude" : "OpenAI"}: ${r.detail}`);
    } catch (e) { show("err", (e as Error).message); }
    await refreshLog();
    setBusy("");
  }
  async function clearKey(k: "claudeKey" | "openaiKey") {
    await api("/api/admin/settings", "PUT", { ai: { [k]: "__clear__" } });
    setAi({ ...ai, [k === "claudeKey" ? "claudeKeyMask" : "openaiKeyMask"]: "" });
    show("ok", "Anahtar silindi");
  }
  const set = (p: Partial<typeof ai>) => setAi({ ...ai, ...p });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">AI & API yönetimi</h1>
        <p className="mt-2 max-w-2xl text-mute">Anahtarlar sunucuda <code>data/ai.json</code> içinde saklanır, tarayıcıya geri gönderilmez. Ortam değişkeni (<code>ANTHROPIC_API_KEY</code>, <code>OPENAI_API_KEY</code>) tanımlıysa o önceliklidir.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Claude — SEO, metin, çeviri, otomatik doldurma">
          <Field label="API anahtarı" hint={initial.envKeys.claude ? "Ortam değişkeninden geliyor." : ai.claudeKeyMask ? `Kayıtlı: ${ai.claudeKeyMask}` : "Henüz girilmedi"}>
            <input type="password" autoComplete="off" className={inputCls} placeholder="sk-ant-…" value={keys.claudeKey} onChange={(e) => setKeys({ ...keys, claudeKey: e.target.value })} />
          </Field>
          <Field label="Model" hint="Örn. claude-sonnet-5-5 — hesabında hangi model varsa onu yaz.">
            <input className={inputCls} value={ai.claudeModel} onChange={(e) => set({ claudeModel: e.target.value })} />
          </Field>
          <Field label="Base URL"><input className={inputCls} value={ai.claudeBaseUrl} onChange={(e) => set({ claudeBaseUrl: e.target.value })} /></Field>
          <div className="flex gap-2">
            <Btn variant="solid" disabled={!!busy} onClick={() => test("claude")}>{busy === "claude" ? "Test ediliyor…" : "Kaydet & test et"}</Btn>
            {ai.claudeKeyMask && !initial.envKeys.claude && <Btn variant="danger" onClick={() => clearKey("claudeKey")}>Anahtarı sil</Btn>}
          </div>
        </Card>
        <Card title="OpenAI — görsel üretimi (ChatGPT image)">
          <Field label="API anahtarı" hint={initial.envKeys.openai ? "Ortam değişkeninden geliyor." : ai.openaiKeyMask ? `Kayıtlı: ${ai.openaiKeyMask}` : "Henüz girilmedi"}>
            <input type="password" autoComplete="off" className={inputCls} placeholder="sk-…" value={keys.openaiKey} onChange={(e) => setKeys({ ...keys, openaiKey: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Görsel modeli"><input className={inputCls} value={ai.imageModel} onChange={(e) => set({ imageModel: e.target.value })} /></Field>
            <Field label="Boyut">
              <select className={inputCls} value={ai.imageSize} onChange={(e) => set({ imageSize: e.target.value })}>
                <option>1024x1024</option><option>1536x1024</option><option>1024x1536</option>
              </select>
            </Field>
          </div>
          <Field label="Base URL"><input className={inputCls} value={ai.openaiBaseUrl} onChange={(e) => set({ openaiBaseUrl: e.target.value })} /></Field>
          <div className="flex gap-2">
            <Btn variant="solid" disabled={!!busy} onClick={() => test("openai")}>{busy === "openai" ? "Test ediliyor…" : "Kaydet & test et"}</Btn>
            {ai.openaiKeyMask && !initial.envKeys.openai && <Btn variant="danger" onClick={() => clearKey("openaiKey")}>Anahtarı sil</Btn>}
          </div>
        </Card>
      </div>
      <Card title="Son çağrılar" actions={<Btn onClick={refreshLog}>Yenile</Btn>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-[11px] uppercase tracking-widest text-mute"><tr><th className="py-2">Zaman</th><th>Sağlayıcı</th><th>İşlem</th><th>Süre</th><th>Sonuç</th></tr></thead>
            <tbody className="divide-y divide-line">
              {log.slice(0, 15).map((l) => (
                <tr key={l.id}><td className="py-2 text-mute">{new Date(l.at).toLocaleString("tr-TR")}</td><td>{l.provider}</td><td>{l.action}</td><td>{l.ms} ms</td>
                  <td className={l.ok ? "text-acid" : "text-ember"}>{l.ok ? "✓" : `✕ ${l.error ?? ""}`}</td></tr>
              ))}
              {log.length === 0 && <tr><td colSpan={5} className="py-4 text-mute">Henüz çağrı yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <Toast msg={msg} />
    </div>
  );
}
