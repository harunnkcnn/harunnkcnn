import { NextResponse } from "next/server";
import { z } from "zod";
import { AiError, claudeJson, getAiSettings } from "@/lib/ai";
import { guard } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { analyzeSeo } from "@/lib/seo";

const In = z.object({
  lang: z.enum(["tr", "en"]),
  title: z.string(), description: z.string(), body: z.string(),
  keywords: z.array(z.string()), slug: z.string(), hasImage: z.boolean(), altText: z.string(),
  deep: z.boolean().optional(),
});

export async function POST(req: Request) {
  const denied = await guard("POST");
  if (denied) return denied;
  const parsed = In.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const { deep, ...input } = parsed.data;
  const report = analyzeSeo(input);
  if (!deep) return NextResponse.json({ report, ai: null });
  try {
    const s = await getAiSettings();
    if (!s.claudeKey) throw new AiError("Claude API anahtarı tanımlı değil (Admin → AI & API).", 400);
    const site = await getSettings();
    const ai = await claudeJson(
      "seo-analysis",
      `Sen teknik ve içerik SEO uzmanısın. ${site.name} portföy sitesindeki bir sayfayı (${input.lang}) değerlendiriyorsun. Türkçe yanıt ver.
JSON şeması: {"verdict": string (2 cümle), "issues": string[] (en kritikten başla, en çok 6), "rewrite": {"title": string, "description": string, "keywords": string[]}, "contentIdeas": string[] (en çok 4, bu sayfayı destekleyecek yeni içerik fikirleri), "schema": string (hangi schema.org türü uygun ve neden)}.
rewrite.title 30–60, rewrite.description 110–160 karakter olmalı.`,
      JSON.stringify({ ...input, localReport: report }),
    );
    return NextResponse.json({ report, ai });
  } catch (e) {
    return NextResponse.json({ report, ai: null, error: (e as Error).message }, { status: e instanceof AiError ? e.status : 500 });
  }
}
