/**
 * Uçtan uca doğrulama: sahte Claude/OpenAI sunucusu + gerçek `next start`.
 * Çalıştır: npm run build && npm run e2e
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const PORT = 3111, MOCK = 4111, BASE = `http://localhost:${PORT}`;
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

const mock = createServer((req, res) => {
  let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => {
    res.setHeader("content-type", "application/json");
    if (req.url === "/v1/messages") {
      if (req.headers["x-api-key"] !== "test-claude") { res.statusCode = 401; return res.end(JSON.stringify({ error: { message: "invalid x-api-key" } })); }
      const sys = JSON.parse(b).system as string;
      const text = sys.includes("rewrite")
        ? JSON.stringify({ verdict: "İyi bir başlangıç.", issues: ["Başlık kısa"], rewrite: { title: "Yeni başlık önerisi için yeterince uzun bir başlık", description: "d".repeat(130), keywords: ["a", "b", "c"] }, contentIdeas: ["fikir"], schema: "CreativeWork" })
        : "Tabii, işte sonuç:\n```json\n" + JSON.stringify({
          title: { tr: "AI Başlık", en: "AI Title" }, summary: { tr: "AI özet", en: "AI summary" },
          body: { tr: "## Giriş\nAI içerik", en: "## Intro\nAI content" }, tags: ["ai", "web"], slug: "ai-baslik",
          seo: { title: { tr: "AI SEO başlığı", en: "AI SEO title" }, description: { tr: "AI açıklama", en: "AI description" }, keywords: ["ai", "web", "seo"], altText: { tr: "AI alt metni burada", en: "AI alt text here" } },
        }) + "\n```";
      return res.end(JSON.stringify({ content: [{ type: "text", text }] }));
    }
    if (req.url === "/v1/images/generations") {
      if (req.headers.authorization !== "Bearer test-openai") { res.statusCode = 401; return res.end(JSON.stringify({ error: { message: "bad key" } })); }
      return res.end(JSON.stringify({ data: [{ b64_json: PNG.toString("base64") }] }));
    }
    if (req.url === "/v1/models") return res.end("{}");
    res.statusCode = 404; res.end("{}");
  });
}).listen(MOCK);

const dataDir = mkdtempSync(path.join(tmpdir(), "studio-e2e-"));
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  env: { ...process.env, DATA_DIR: dataDir, ADMIN_PASSWORD: "e2e-pass", INSECURE_COOKIES: "1", ANTHROPIC_BASE_URL: `http://localhost:${MOCK}`, OPENAI_BASE_URL: `http://localhost:${MOCK}`, SITE_URL: "https://example.test" },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true, // süreç grubunu birlikte kapatabilmek için
});
let serverLog = ""; server.stdout.on("data", (d) => (serverLog += d)); server.stderr.on("data", (d) => (serverLog += d));

let cookie = "";
const call = async (p: string, init: RequestInit & { json?: unknown } = {}) => {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);
  if (init.json !== undefined) headers.set("content-type", "application/json");
  const res = await fetch(BASE + p, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body, redirect: "manual" });
  const set = res.headers.get("set-cookie");
  if (set?.includes("hs_admin")) cookie = set.split(";")[0];
  return res;
};

// Büyük HTML gövdelerini hata çıktısına basmamak için kısa mesajlı eşleştirme.
const has = (text: string, re: RegExp) => assert.ok(re.test(text), `Eşleşmedi: ${re}`);
let passed = 0;
const step = async (name: string, fn: () => Promise<void>) => { await fn(); passed++; console.log(`  ✓ ${name}`); };

async function main() {
  for (let i = 0; i < 60; i++) { try { await fetch(BASE + "/tr"); break; } catch { await new Promise((r) => setTimeout(r, 500)); } }
  console.log("E2E:");
  await step("/ → /tr yönlendirir", async () => { const r = await call("/"); assert.equal(r.status, 307); assert.match(r.headers.get("location")!, /\/tr$/); });
  await step("ana sayfa TR: h1, canonical, hreflang, JSON-LD", async () => {
    const h = await (await call("/tr")).text();
    has(h, /<html lang="tr"/); has(h, /<h1/); has(h, /rel="canonical" href="[^"]+\/tr"/);
    has(h, /hrefLang="en"|hreflang="en"/i); has(h, /application\/ld\+json/);
  });
  await step("EN sayfa lang=en", async () => has(await (await call("/en")).text(), /<html lang="en"/));
  await step("geçersiz dil 404", async () => assert.equal((await call("/de")).status, 404));
  await step("proje ve yazı detayı", async () => {
    assert.equal((await call("/tr/work/sevkiyat-depo-paneli")).status, 200);
    assert.equal((await call("/en/blog/yapay-zeka-ile-web-sitesi")).status, 200);
  });
  await step("sitemap + robots", async () => {
    const s = await (await call("/sitemap.xml")).text(); has(s, /\/tr\/work\/sevkiyat-depo-paneli/);
    const r = await (await call("/robots.txt")).text(); assert.match(r, /Disallow: \/admin/);
  });
  await step("üretken kapak SVG + OG görseli", async () => {
    assert.match((await call("/api/cover/x")).headers.get("content-type")!, /svg/);
    assert.match((await call("/api/og?title=Merhaba")).headers.get("content-type")!, /png/);
  });
  await step("iletişim formu: geçersiz 400, geçerli 200, honeypot reddi", async () => {
    assert.equal((await call("/api/contact", { method: "POST", json: { name: "A", email: "x", text: "kısa" } })).status, 400);
    assert.equal((await call("/api/contact", { method: "POST", json: { name: "Ayşe Yılmaz", email: "a@b.co", budget: "", text: "Merhaba, web sitesi istiyorum." } })).status, 200);
    assert.equal((await call("/api/contact", { method: "POST", json: { name: "Bot", email: "a@b.co", text: "spam spam spam spam", website: "x" } })).status, 400);
  });
  await step("admin: oturumsuz erişim engellenir", async () => {
    const r = await call("/admin"); assert.equal(r.status, 307); assert.match(r.headers.get("location")!, /\/admin\/login/);
    assert.equal((await call("/api/admin/settings")).status, 401);
    assert.equal((await call("/api/admin/entity/projects")).status, 401);
  });
  await step("yanlış şifre 401, doğru şifre oturum açar", async () => {
    assert.equal((await call("/api/admin/login", { method: "POST", json: { password: "yanlis" } })).status, 401);
    assert.equal((await call("/api/admin/login", { method: "POST", json: { password: "e2e-pass" } })).status, 200);
    assert.ok(cookie.startsWith("hs_admin="));
    assert.equal((await call("/admin")).status, 200);
  });
  await step("CSRF: yabancı origin reddedilir", async () => {
    const r = await call("/api/admin/settings", { method: "PUT", headers: { origin: "https://evil.test" }, json: { site: {} } });
    assert.equal(r.status, 403);
  });
  await step("mesaj admin'de görünür", async () => has(await (await call("/admin/messages")).text(), /Ayşe Yılmaz/));

  let id = "";
  await step("AI anahtarı yokken fill anlamlı hata verir", async () => {
    const r = await call("/api/admin/ai/fill", { method: "POST", json: { collection: "projects", entry: { title: { tr: "x", en: "" } } } });
    assert.equal(r.status, 400); assert.match(((await r.json()) as { error: string }).error, /anahtar/i);
  });
  await step("API anahtarlarını kaydet + bağlantı testi", async () => {
    assert.equal((await call("/api/admin/settings", { method: "PUT", json: { ai: { claudeKey: "test-claude", openaiKey: "test-openai" } } })).status, 200);
    const s = (await (await call("/api/admin/settings")).json()) as { ai: { claudeKey: string; claudeKeyMask: string } };
    assert.equal(s.ai.claudeKey, ""); assert.match(s.ai.claudeKeyMask, /…/); // anahtar istemciye dönmez
    assert.equal((await call("/api/admin/ai/test", { method: "POST", json: { provider: "claude" } })).status, 200);
    assert.equal((await call("/api/admin/ai/test", { method: "POST", json: { provider: "openai" } })).status, 200);
  });
  await step("yeni proje oluştur → AI ile doldur (yalnız boşlar) → kaydet", async () => {
    const blank = { id: "", slug: "", kind: "design", title: { tr: "Test Projesi", en: "" }, summary: { tr: "", en: "" }, body: { tr: "", en: "" }, cover: "", tags: [], year: "2026", client: "", url: "", featured: false, published: false, createdAt: "", updatedAt: "", seo: { title: { tr: "", en: "" }, description: { tr: "", en: "" }, keywords: [], altText: { tr: "", en: "" } } };
    const filled = (await (await call("/api/admin/ai/fill", { method: "POST", json: { collection: "projects", entry: blank, overwrite: false } })).json()) as typeof blank;
    assert.equal(filled.title.tr, "Test Projesi"); // dolu alan korunur
    assert.equal(filled.title.en, "AI Title"); assert.equal(filled.summary.tr, "AI özet"); assert.deepEqual(filled.seo.keywords, ["ai", "web", "seo"]);
    const saved = (await (await call("/api/admin/entity/projects", { method: "PUT", json: { ...filled, published: true } })).json()) as { id: string; slug: string };
    id = saved.id; assert.ok(id); assert.match(saved.slug, /^[a-z0-9-]+$/);
    // yayınlanan yeni sayfa derlemeden sonra da erişilebilir olmalı
    assert.equal((await call(`/tr/work/${saved.slug}`)).status, 200);
    has(await (await call("/tr")).text(), /AI Title|Test Projesi/);
  });
  await step("zod doğrulaması bozuk veriyi reddeder", async () => {
    assert.equal((await call("/api/admin/entity/projects", { method: "PUT", json: { title: "string" } })).status, 400);
  });
  await step("SEO: yerel analiz + Claude derin analiz", async () => {
    const input = { lang: "tr", title: "t", description: "d", body: "b", keywords: [], slug: "x", hasImage: false, altText: "" };
    const local = (await (await call("/api/admin/ai/seo", { method: "POST", json: input })).json()) as { report: { score: number }; ai: null };
    assert.ok(local.report.score < 50); assert.equal(local.ai, null);
    const deep = (await (await call("/api/admin/ai/seo", { method: "POST", json: { ...input, deep: true } })).json()) as { ai: { rewrite: { title: string } } };
    assert.match(deep.ai.rewrite.title, /başlık/);
  });
  await step("görsel üretimi dosyayı kaydeder ve /media'dan sunar", async () => {
    const r = (await (await call("/api/admin/ai/image", { method: "POST", json: { prompt: "test görseli" } })).json()) as { url: string };
    assert.match(r.url, /^\/media\/.+\.png$/);
    const img = await call(r.url); assert.equal(img.status, 200); assert.equal(img.headers.get("content-type"), "image/png");
    assert.equal((await call("/media/..%2Fsecret.json")).status, 404);
  });
  await step("AI çağrı günlüğü kaydedildi", async () => {
    const log = (await (await call("/api/admin/ai/test")).json()) as { ok: boolean; provider: string; action: string }[];
    assert.ok(log.some((l) => l.provider === "openai" && l.action === "image")); assert.ok(log.length >= 4);
  });
  await step("proje sil → sayfa 404", async () => {
    const slug = ((await (await call("/api/admin/entity/projects")).json()) as { id: string; slug: string }[]).find((p) => p.id === id)!.slug;
    assert.equal((await call(`/api/admin/entity/projects?id=${id}`, { method: "DELETE" })).status, 200);
    assert.equal((await call(`/tr/work/${slug}`)).status, 404);
  });
  await step("çıkış sonrası admin kapanır", async () => {
    await call("/api/admin/logout", { method: "POST" });
    cookie = "";
    assert.equal((await call("/admin")).status, 307);
  });
  assert.ok(existsSync(path.join(dataDir, "ailog.json")));
  console.log(`\n${passed} adım geçti.`);
}

main().then(() => 0).catch((e) => { console.error("\nBAŞARISIZ:", e); console.error("--- sunucu günlüğü ---\n" + serverLog.slice(-2500)); return 1; })
  .then((code) => { try { process.kill(-server.pid!, "SIGKILL"); } catch {} mock.close(); setTimeout(() => process.exit(code), 300); });
