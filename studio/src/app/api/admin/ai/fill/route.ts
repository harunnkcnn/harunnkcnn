import { NextResponse } from "next/server";
import { AiError } from "@/lib/ai";
import { aiFill } from "@/lib/aifill";
import { guard } from "@/lib/auth";
import type { Collection, Entity } from "@/lib/types";

export async function POST(req: Request) {
  const denied = await guard("POST");
  if (denied) return denied;
  const { collection, entry, overwrite } = (await req.json().catch(() => ({}))) as { collection?: Collection; entry?: Entity; overwrite?: boolean };
  if (!collection || !entry || !["projects", "posts", "services"].includes(collection)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  try {
    return NextResponse.json(await aiFill(collection, entry, !!overwrite));
  } catch (e) {
    const status = e instanceof AiError ? e.status : 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
