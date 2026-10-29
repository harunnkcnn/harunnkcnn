import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/ai";
import { guard } from "@/lib/auth";

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

export async function POST(req: Request) {
  const denied = await guard("POST");
  if (denied) return denied;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Yalnızca PNG, JPG, WEBP, GIF" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "En fazla 8 MB" }, { status: 400 });
  const name = await saveUpload(Buffer.from(await file.arrayBuffer()), ext);
  return NextResponse.json({ url: `/media/${name}` });
}
