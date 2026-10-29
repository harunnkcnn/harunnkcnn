import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/content";
import { SITE_URL } from "@/lib/util";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([listPublished("projects"), listPublished("posts")]);
  const entry = (path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}/tr${path}`, lastModified, priority,
    alternates: { languages: { tr: `${SITE_URL}/tr${path}`, en: `${SITE_URL}/en${path}` } },
  });
  return [
    entry("", undefined, 1), entry("/blog", undefined, 0.8),
    ...projects.map((p) => entry(`/work/${p.slug}`, p.updatedAt)),
    ...posts.map((p) => entry(`/blog/${p.slug}`, p.updatedAt)),
  ];
}
