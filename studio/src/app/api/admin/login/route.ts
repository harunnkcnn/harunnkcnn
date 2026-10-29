import { NextResponse } from "next/server";
import { debug } from "@/lib/debug";
import { checkPassword, createSession, loginFailed, loginOk, loginThrottle } from "@/lib/auth";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const wait = loginThrottle(ip);
  if (wait) return NextResponse.json({ error: `Çok fazla deneme. ${wait} sn sonra tekrar deneyin.` }, { status: 429 });
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    loginFailed(ip);
    debug("login.fail", { ip });
    return NextResponse.json({ error: "Şifre hatalı" }, { status: 401 });
  }
  loginOk(ip);
  debug("login.ok", { ip });
  await createSession();
  return NextResponse.json({ ok: true });
}
