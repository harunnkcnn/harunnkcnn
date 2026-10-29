import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeSeo } from "../src/lib/seo";
import { renderMd } from "../src/lib/md";
import { slugify } from "../src/lib/slug";
import { extractJson } from "../src/lib/ai";

test("slugify Türkçe karakterleri çevirir", () => {
  assert.equal(slugify("Sevkiyat & Depo Paneli İçin Çözüm"), "sevkiyat-depo-paneli-icin-cozum");
  assert.equal(slugify("  ÇĞİÖŞÜ  "), "cgiosu");
});

test("renderMd HTML'i kaçışlar ve temel biçimleri çevirir", () => {
  const html = renderMd("## Başlık\n<script>alert(1)</script>\n- **kalın** madde\n[a](javascript:alert(1))");
  assert.ok(html.includes("<h2>Başlık</h2>"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("<li><strong>kalın</strong> madde</li>"));
  assert.ok(!html.includes('href="javascript'));
});

test("analyzeSeo: eksik içerik düşük, tam içerik yüksek skor", () => {
  const empty = analyzeSeo({ title: "", description: "", body: "", keywords: [], slug: "", hasImage: false, altText: "", lang: "tr" });
  assert.ok(empty.score < 20);
  const body = "## A\n" + "kelime ".repeat(160) + "\n## B\ndevam";
  const full = analyzeSeo({
    title: "Web sitesi tasarımı ve yazılım hizmetleri", description: "Web sitesi tasarımı, özel yazılım ve otomasyon çözümleri sunan stüdyo; hızlı, SEO uyumlu ve ölçülebilir sonuçlar için bugün iletişime geçin.",
    body, keywords: ["web sitesi", "yazılım", "tasarım"], slug: "web-sitesi", hasImage: true, altText: "Portföy sitesi ekran görüntüsü", lang: "tr",
  });
  assert.equal(full.score, 100, JSON.stringify(full.checks.filter((c) => !c.ok)));
});

test("extractJson kod bloğu ve açıklamayla gelen yanıtı çözer", () => {
  assert.deepEqual(extractJson('Tabii:\n```json\n{"a":1}\n```'), { a: 1 });
  assert.throws(() => extractJson("json yok"));
  assert.throws(() => extractJson("{bozuk"));
});
