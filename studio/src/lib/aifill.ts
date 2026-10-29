import { z } from "zod";
import { claudeJson } from "./ai";
import { getSettings, slugify } from "./content";
import type { Collection, Entity, L, Seo } from "./types";

const Loc = z.object({ tr: z.string().default(""), en: z.string().default("") }).partial();
const Suggestion = z.object({
  title: Loc.optional(),
  summary: Loc.optional(),
  excerpt: Loc.optional(),
  body: Loc.optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  seo: z
    .object({
      title: Loc.optional(),
      description: Loc.optional(),
      keywords: z.array(z.string()).optional(),
      altText: Loc.optional(),
    })
    .optional(),
});
type Suggestion = z.infer<typeof Suggestion>;

const FIELDS: Record<Collection, string[]> = {
  projects: ["title", "summary", "body", "tags", "slug", "seo"],
  posts: ["title", "excerpt", "body", "tags", "slug", "seo"],
  services: ["title", "summary"],
};

const blank = (v: unknown) => (typeof v === "string" ? v.trim() === "" : Array.isArray(v) ? v.length === 0 : !v);

function mergeL(cur: L | undefined, sug: Partial<L> | undefined, overwrite: boolean): L {
  const base = cur ?? { tr: "", en: "" };
  return {
    tr: sug?.tr && (overwrite || blank(base.tr)) ? sug.tr : base.tr,
    en: sug?.en && (overwrite || blank(base.en)) ? sug.en : base.en,
  };
}

export async function aiFill(collection: Collection, entry: Entity, overwrite: boolean): Promise<Entity> {
  const site = await getSettings();
  const fields = FIELDS[collection];
  const system = [
    `Sen ${site.name} adlı ${site.role.tr} için çalışan kıdemli bir içerik stratejisti ve SEO uzmanısın.`,
    "Portföy sitesi iki dillidir (tr ve en). Her metin alanını iki dilde, doğal ve satış kokmayan bir tonda üret.",
    "Kurallar: SEO başlığı 30–60 karakter, meta açıklama 110–160 karakter, ana anahtar kelime ilk sırada olmalı (3–8 anahtar kelime).",
    "body alanı markdown olmalı: ## alt başlıklar, - listeler; en az 150 kelime. Uydurma müşteri adı, sayı veya referans yazma.",
    "slug küçük harf latin karakter ve tireden oluşsun. altText görseli tarif eden 10+ karakterlik bir cümle olsun.",
    `Döndürülecek JSON anahtarları: ${fields.join(", ")}. Yerelleştirilmiş alanlar {"tr": "...", "en": "..."} biçiminde; seo = {title:{tr,en}, description:{tr,en}, keywords:[], altText:{tr,en}}; tags = string dizisi.`,
  ].join("\n");
  const user = `Koleksiyon: ${collection}\nMevcut kayıt (boş alanları doldur, dolu alanlardaki bilgiyi temel al):\n${JSON.stringify(entry)}`;
  const parsed = Suggestion.parse(await claudeJson(`fill:${collection}`, system, user));

  const next = structuredClone(entry) as Entity & Record<string, any>;
  const keys = ["title", "summary", "excerpt", "body"] as const;
  for (const k of keys) if (k in next && parsed[k]) next[k] = mergeL(next[k], parsed[k], overwrite);
  if ("tags" in next && parsed.tags?.length && (overwrite || blank(next.tags))) next.tags = parsed.tags.slice(0, 8);
  if (parsed.slug && "slug" in next && (overwrite || blank(next.slug))) next.slug = slugify(parsed.slug);
  if (parsed.seo && "seo" in next) {
    const s = next.seo as Seo;
    next.seo = {
      title: mergeL(s.title, parsed.seo.title, overwrite),
      description: mergeL(s.description, parsed.seo.description, overwrite),
      altText: mergeL(s.altText, parsed.seo.altText, overwrite),
      keywords: parsed.seo.keywords?.length && (overwrite || blank(s.keywords)) ? parsed.seo.keywords.slice(0, 10) : s.keywords,
    };
  }
  return next;
}
