import { promises as fs } from "node:fs";
import path from "node:path";
import { MIME, UPLOAD_DIR } from "@/lib/ai";

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9-]+\.(png|jpe?g|webp|gif)$/i.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: { "content-type": MIME[name.split(".").pop()!.toLowerCase()], "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
