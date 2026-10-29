import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "@/lib/debug";
import { guard } from "@/lib/auth";
import { list, remove, save } from "@/lib/content";
import type { Collection, Entity } from "@/lib/types";

const COLLECTIONS = ["projects", "posts", "services"] as const;
const L = z.object({ tr: z.string().max(20000), en: z.string().max(20000) });
const SeoS = z.object({ title: L, description: L, keywords: z.array(z.string().max(80)).max(20), altText: L });
const base = { id: z.string().max(64), slug: z.string().max(120), published: z.boolean(), createdAt: z.string(), updatedAt: z.string() };
const Kind = z.enum(["software", "design"]);

const schemas = {
  projects: z.object({ ...base, kind: Kind, title: L, summary: L, body: L, cover: z.string().max(500), tags: z.array(z.string().max(50)).max(20), year: z.string().max(10), client: z.string().max(120), url: z.string().max(300), featured: z.boolean(), seo: SeoS }),
  posts: z.object({ ...base, title: L, excerpt: L, body: L, cover: z.string().max(500), tags: z.array(z.string().max(50)).max(20), seo: SeoS }),
  services: z.object({ ...base, kind: Kind, title: L, summary: L, icon: z.string().max(4), order: z.number().int() }),
};

type Ctx = { params: Promise<{ collection: string }> };
const valid = (c: string): c is Collection => (COLLECTIONS as readonly string[]).includes(c);
const refresh = () => revalidatePath("/", "layout");

export async function GET(_: Request, { params }: Ctx) {
  const denied = await guard("GET");
  if (denied) return denied;
  const { collection } = await params;
  if (!valid(collection)) return NextResponse.json({ error: "Bilinmeyen koleksiyon" }, { status: 404 });
  return NextResponse.json(await list(collection));
}

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard("PUT");
  if (denied) return denied;
  const { collection } = await params;
  if (!valid(collection)) return NextResponse.json({ error: "Bilinmeyen koleksiyon" }, { status: 404 });
  const parsed = schemas[collection].safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.issues.slice(0, 5) }, { status: 400 });
  if (!parsed.data.title.tr.trim()) return NextResponse.json({ error: "Türkçe başlık zorunlu" }, { status: 400 });
  const saved = await save(collection, parsed.data as never as Entity & never);
  refresh();
  debug("entity.save", { collection, id: saved.id, slug: saved.slug });
  return NextResponse.json(saved);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await guard("DELETE");
  if (denied) return denied;
  const { collection } = await params;
  const id = new URL(req.url).searchParams.get("id");
  if (!valid(collection) || !id) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  await remove(collection, id);
  refresh();
  debug("entity.delete", { collection, id });
  return NextResponse.json({ ok: true });
}
