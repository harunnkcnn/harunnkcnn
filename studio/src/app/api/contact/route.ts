import { NextResponse } from "next/server";
import { z } from "zod";
import { addMessage } from "@/lib/content";

const In = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  budget: z.string().max(60).default(""),
  text: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(), // honeypot
});

const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const recent = (hits.get(ip) ?? []).filter((t) => Date.now() - t < 10 * 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
  hits.set(ip, [...recent, Date.now()]);
  const p = In.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Lütfen alanları kontrol edin" }, { status: 400 });
  const { website: _hp, ...data } = p.data;
  await addMessage(data);
  return NextResponse.json({ ok: true });
}
