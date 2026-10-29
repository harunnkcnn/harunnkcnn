import type { Entity, Lang } from "./types";
import type { SeoInput } from "./seo";

type Loose = Entity & Partial<{ body: { tr: string; en: string }; excerpt: { tr: string; en: string }; summary: { tr: string; en: string }; cover: string; seo: { title: { tr: string; en: string }; description: { tr: string; en: string }; keywords: string[]; altText: { tr: string; en: string } } }>;

export function seoInputOf(e: Entity, lang: Lang): SeoInput {
  const x = e as Loose;
  return {
    lang,
    title: x.seo?.title[lang] ?? "",
    description: x.seo?.description[lang] ?? "",
    body: x.body?.[lang] ?? x.summary?.[lang] ?? "",
    keywords: x.seo?.keywords ?? [],
    slug: x.slug,
    hasImage: !!x.cover,
    altText: x.seo?.altText[lang] ?? "",
  };
}
