import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAiSettings, maskKey, saveAiSettings } from "@/lib/ai";
import { guard } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/content";

const L = z.object({ tr: z.string().max(5000), en: z.string().max(5000) });
const Site = z.object({
  name: z.string().max(100), role: L, heroLine: L, about: L,
  email: z.string().max(200), linkedin: z.string().max(300), behance: z.string().max(300), github: z.string().max(300),
  seo: z.object({ title: L, description: L, keywords: z.array(z.string().max(80)).max(20), altText: L }),
});
const Ai = z.object({
  claudeModel: z.string().max(100), imageModel: z.string().max(100), imageSize: z.string().max(20),
  claudeBaseUrl: z.string().url(), openaiBaseUrl: z.string().url(),
  claudeKey: z.string().max(300), openaiKey: z.string().max(300),
}).partial();

export async function GET() {
  const denied = await guard("GET");
  if (denied) return denied;
  const ai = await getAiSettings();
  return NextResponse.json({
    site: await getSettings(),
    ai: { ...ai, claudeKey: "", openaiKey: "", claudeKeyMask: maskKey(ai.claudeKey), openaiKeyMask: maskKey(ai.openaiKey) },
    envKeys: { claude: !!process.env.ANTHROPIC_API_KEY, openai: !!process.env.OPENAI_API_KEY },
  });
}

export async function PUT(req: Request) {
  const denied = await guard("PUT");
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { site?: unknown; ai?: unknown };
  if (body.site) {
    const p = Site.safeParse(body.site);
    if (!p.success) return NextResponse.json({ error: "Geçersiz site ayarı" }, { status: 400 });
    await saveSettings(p.data);
    revalidatePath("/", "layout");
  }
  if (body.ai) {
    const p = Ai.safeParse(body.ai);
    if (!p.success) return NextResponse.json({ error: "Geçersiz AI ayarı" }, { status: 400 });
    await saveAiSettings(p.data);
  }
  return NextResponse.json({ ok: true });
}
