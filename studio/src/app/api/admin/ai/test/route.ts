import { NextResponse } from "next/server";
import { claudeText, getAiSettings, getLog } from "@/lib/ai";
import { guard } from "@/lib/auth";

export async function GET() {
  const denied = await guard("GET");
  if (denied) return denied;
  return NextResponse.json(await getLog());
}

/** Anahtarın çalıştığını ucuz bir çağrıyla doğrular. OpenAI için modeller listesi kullanılır (görsel ücreti yok). */
export async function POST(req: Request) {
  const denied = await guard("POST");
  if (denied) return denied;
  const { provider } = (await req.json().catch(() => ({}))) as { provider?: string };
  try {
    if (provider === "claude") {
      const out = await claudeText("test", "Sadece 'ok' yaz.", "ping", 10);
      return NextResponse.json({ ok: true, detail: out.slice(0, 40) });
    }
    if (provider === "openai") {
      const s = await getAiSettings();
      if (!s.openaiKey) return NextResponse.json({ ok: false, error: "OpenAI anahtarı tanımlı değil" }, { status: 400 });
      const res = await fetch(`${s.openaiBaseUrl.replace(/\/+$/, "")}/v1/models`, {
        headers: { authorization: `Bearer ${s.openaiKey}` },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) return NextResponse.json({ ok: false, error: `OpenAI yanıtı ${res.status}` }, { status: 502 });
      return NextResponse.json({ ok: true, detail: "Bağlantı başarılı" });
    }
    return NextResponse.json({ error: "Geçersiz sağlayıcı" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
