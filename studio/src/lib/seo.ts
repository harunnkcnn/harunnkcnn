import type { Lang } from "./types";

export type SeoInput = {
  title: string;
  description: string;
  body: string;
  keywords: string[];
  slug: string;
  hasImage: boolean;
  altText: string;
  lang: Lang;
};
export type SeoCheck = { id: string; label: string; ok: boolean; weight: number; hint: string };
export type SeoReport = { score: number; checks: SeoCheck[]; words: number };

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const fold = (s: string) => s.toLocaleLowerCase("tr");

/** Yapay zekâ gerektirmeyen, anında çalışan temel SEO skoru. */
export function analyzeSeo(i: SeoInput): SeoReport {
  const primary = i.keywords[0] ? fold(i.keywords[0]) : "";
  const tl = i.title.trim().length;
  const dl = i.description.trim().length;
  const wc = words(i.body);
  const headings = (i.body.match(/^##\s+/gm) || []).length;
  const checks: SeoCheck[] = [
    { id: "title-len", label: "Başlık uzunluğu (30–60)", ok: tl >= 30 && tl <= 60, weight: 15, hint: `Şu an ${tl} karakter. Arama sonuçlarında kesilmemesi için 30–60 arası olmalı.` },
    { id: "desc-len", label: "Meta açıklama (110–160)", ok: dl >= 110 && dl <= 160, weight: 15, hint: `Şu an ${dl} karakter. 110–160 arası tıklama oranını artırır.` },
    { id: "kw-set", label: "Anahtar kelimeler tanımlı (3+)", ok: i.keywords.length >= 3, weight: 10, hint: "En az 3 anahtar kelime belirleyin; ilki ana kelime olsun." },
    { id: "kw-title", label: "Ana kelime başlıkta", ok: !!primary && fold(i.title).includes(primary), weight: 15, hint: "Ana anahtar kelimeyi başlığa doğal biçimde ekleyin." },
    { id: "kw-desc", label: "Ana kelime açıklamada", ok: !!primary && fold(i.description).includes(primary), weight: 10, hint: "Ana kelimeyi meta açıklamada kullanın." },
    { id: "slug", label: "Temiz slug", ok: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(i.slug) && i.slug.length <= 60, weight: 5, hint: "Slug küçük harf, rakam ve tire içermeli." },
    { id: "body-len", label: "İçerik yeterli (150+ kelime)", ok: wc >= 150, weight: 10, hint: `Şu an ${wc} kelime. Arama motorları için daha kapsamlı içerik faydalı.` },
    { id: "headings", label: "Alt başlıklar (##) var", ok: headings >= 2, weight: 5, hint: "İçeriği en az 2 alt başlıkla bölün." },
    { id: "img", label: "Görsel mevcut", ok: i.hasImage, weight: 5, hint: "Kapak görseli ekleyin." },
    { id: "alt", label: "Görsel alt metni", ok: i.altText.trim().length >= 10, weight: 10, hint: "Görseli tarif eden bir alt metin yazın (erişilebilirlik + SEO)." },
  ];
  const total = checks.reduce((a, c) => a + c.weight, 0);
  const got = checks.filter((c) => c.ok).reduce((a, c) => a + c.weight, 0);
  return { score: Math.round((got / total) * 100), checks, words: wc };
}
