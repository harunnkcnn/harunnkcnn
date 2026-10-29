import { NextResponse } from "next/server";
import { AiError, claudeText, getAiSettings, openaiImage } from "@/lib/ai";
import { guard } from "@/lib/auth";

const STYLE =
  "Editorial, high-contrast, dark ink background with acid-lime and ember-orange accents, grain texture, bold geometric composition, no text, no logos, no watermark.";

export async function POST(req: Request) {
  const denied = await guard("POST");
  if (denied) return denied;
  const { prompt, title, summary, craft } = (await req.json().catch(() => ({}))) as {
    prompt?: string; title?: string; summary?: string; craft?: boolean;
  };
  try {
    let finalPrompt = (prompt || "").trim();
    // Claude anahtarı varsa ve istenirse, kısa başlıktan sanatsal bir görsel promptu yazdır.
    if (craft || !finalPrompt) {
      const s = await getAiSettings();
      const seed = finalPrompt || `${title ?? ""}. ${summary ?? ""}`.trim();
      if (!seed) return NextResponse.json({ error: "Prompt ya da başlık gerekli" }, { status: 400 });
      finalPrompt = s.claudeKey
        ? (await claudeText("image-prompt", "Bir görsel üretim modeli için tek paragraflık, İngilizce, somut sahne/ışık/kompozisyon içeren bir prompt yaz. Yalnızca promptu döndür.", `Konu: ${seed}\nStil: ${STYLE}`, 400)).trim()
        : `${seed}. ${STYLE}`;
    }
    const { name } = await openaiImage("image", finalPrompt);
    return NextResponse.json({ url: `/media/${name}`, prompt: finalPrompt });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: e instanceof AiError ? e.status : 500 });
  }
}
