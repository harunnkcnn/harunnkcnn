import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { deleteMessage, markMessage } from "@/lib/content";

export async function PATCH(req: Request) {
  const denied = await guard("PATCH");
  if (denied) return denied;
  const { id, read } = (await req.json().catch(() => ({}))) as { id?: string; read?: boolean };
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  await markMessage(id, read !== false);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await guard("DELETE");
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  await deleteMessage(id);
  return NextResponse.json({ ok: true });
}
