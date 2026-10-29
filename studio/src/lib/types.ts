export type Lang = "tr" | "en";
export const LANGS: Lang[] = ["tr", "en"];
export type L = { tr: string; en: string };

export type Seo = {
  title: L;
  description: L;
  keywords: string[];
  altText: L;
};

export type Kind = "software" | "design";

export type Project = {
  id: string;
  slug: string;
  kind: Kind;
  title: L;
  summary: L;
  body: L;
  cover: string;
  tags: string[];
  year: string;
  client: string;
  url: string;
  featured: boolean;
  published: boolean;
  seo: Seo;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  slug: string;
  title: L;
  excerpt: L;
  body: L;
  cover: string;
  tags: string[];
  published: boolean;
  seo: Seo;
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: string;
  slug: string;
  kind: Kind;
  title: L;
  summary: L;
  icon: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  budget: string;
  text: string;
  read: boolean;
  createdAt: string;
};

export type SiteSettings = {
  name: string;
  role: L;
  heroLine: L;
  about: L;
  email: string;
  linkedin: string;
  behance: string;
  github: string;
  seo: Seo;
};

export type AiSettings = {
  claudeModel: string;
  imageModel: string;
  imageSize: string;
  claudeBaseUrl: string;
  openaiBaseUrl: string;
  claudeKey: string;
  openaiKey: string;
};

export type AiLogEntry = {
  id: string;
  at: string;
  provider: "claude" | "openai";
  action: string;
  ok: boolean;
  ms: number;
  error?: string;
};

export type Collection = "projects" | "posts" | "services";
export type Entity = Project | Post | Service;
