import type { L, Lang } from "./types";

export const t = (v: L | undefined, lang: Lang) => (v ? v[lang] || v.tr || v.en || "" : "");
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const emptyL = (): L => ({ tr: "", en: "" });
export const isLang = (s: string): s is Lang => s === "tr" || s === "en";
export const coverUrl = (cover: string, slug: string) => cover || `/api/cover/${encodeURIComponent(slug)}`;
