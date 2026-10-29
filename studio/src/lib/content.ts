import { readJson, updateJson, writeJson, uid } from "./db";
import { seedPosts, seedProjects, seedServices, seedSettings } from "./seed";
import type { Collection, Entity, Message, Post, Project, Service, SiteSettings } from "./types";

type Map = { projects: Project; posts: Post; services: Service };
const seeds: { [K in Collection]: Map[K][] } = { projects: seedProjects, posts: seedPosts, services: seedServices };

export async function list<K extends Collection>(c: K): Promise<Map[K][]> {
  const existing = await readJson<Map[K][] | null>(c, null);
  if (existing) return existing;
  await writeJson(c, seeds[c]);
  return seeds[c];
}

export async function listPublished<K extends Collection>(c: K): Promise<Map[K][]> {
  const all = await list(c);
  const pub = all.filter((e) => e.published);
  if (c === "services") return (pub as Service[]).sort((a, b) => a.order - b.order) as Map[K][];
  return pub.sort((a, b) => ((b as Project).createdAt > (a as Project).createdAt ? 1 : -1));
}

export async function getBySlug<K extends Collection>(c: K, slug: string, includeDrafts = false) {
  const all = await list(c);
  return all.find((e) => e.slug === slug && (includeDrafts || e.published));
}

export async function getById<K extends Collection>(c: K, id: string) {
  return (await list(c)).find((e) => e.id === id);
}

export { slugify } from "./slug";
import { slugify } from "./slug";

export async function save<K extends Collection>(c: K, entry: Map[K]): Promise<Map[K]> {
  await list(c); // tohumlamayı garanti et
  let saved = entry;
  await updateJson<Map[K][]>(c, [], (all) => {
    const now = new Date().toISOString();
    const slugTaken = (s: string, id: string) => all.some((e) => e.slug === s && e.id !== id);
    let id = entry.id || uid();
    let slug = slugify(entry.slug || (entry as Entity & { title: { tr: string } }).title.tr) || `kayit-${id}`;
    while (slugTaken(slug, id)) slug = `${slug}-${uid().slice(0, 3)}`;
    const prev = all.find((e) => e.id === id);
    saved = { ...entry, id, slug, createdAt: prev?.createdAt ?? now, updatedAt: now } as Map[K];
    return prev ? all.map((e) => (e.id === id ? saved : e)) : [saved, ...all];
  });
  return saved;
}

export async function remove(c: Collection, id: string) {
  await list(c);
  await updateJson<Entity[]>(c, [], (all) => all.filter((e) => e.id !== id));
}

export async function getSettings(): Promise<SiteSettings> {
  const s = await readJson<SiteSettings | null>("site", null);
  if (s) return { ...seedSettings, ...s };
  await writeJson("site", seedSettings);
  return seedSettings;
}
export const saveSettings = (s: SiteSettings) => writeJson("site", s);

export const listMessages = () => readJson<Message[]>("messages", []);
export async function addMessage(m: Omit<Message, "id" | "read" | "createdAt">) {
  const msg: Message = { ...m, id: uid(), read: false, createdAt: new Date().toISOString() };
  await updateJson<Message[]>("messages", [], (all) => [msg, ...all].slice(0, 500));
  return msg;
}
export const markMessage = (id: string, read: boolean) =>
  updateJson<Message[]>("messages", [], (all) => all.map((m) => (m.id === id ? { ...m, read } : m)));
export const deleteMessage = (id: string) =>
  updateJson<Message[]>("messages", [], (all) => all.filter((m) => m.id !== id));
