import type { Collection, Entity, Seo } from "./types";

const L = () => ({ tr: "", en: "" });
export const blankSeo = (): Seo => ({ title: L(), description: L(), keywords: [], altText: L() });

export function blankEntity(c: Collection): Entity {
  const base = { id: "", slug: "", published: false, createdAt: "", updatedAt: "" };
  if (c === "projects")
    return { ...base, kind: "software", title: L(), summary: L(), body: L(), cover: "", tags: [], year: String(new Date().getFullYear()), client: "", url: "", featured: false, seo: blankSeo() };
  if (c === "posts") return { ...base, title: L(), excerpt: L(), body: L(), cover: "", tags: [], seo: blankSeo() };
  return { ...base, kind: "software", title: L(), summary: L(), icon: "✦", order: 99, published: true };
}

export const LABELS: Record<Collection, { singular: string; plural: string }> = {
  projects: { singular: "Proje", plural: "Projeler" },
  posts: { singular: "Yazı", plural: "Yazılar" },
  services: { singular: "Hizmet", plural: "Hizmetler" },
};
