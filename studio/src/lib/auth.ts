import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { readJson, writeJson } from "./db";

const COOKIE = "hs_admin";
const TTL_MS = 1000 * 60 * 60 * 12;

export const DEFAULT_PASSWORD = "degistir-beni";
export const adminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

async function secret(): Promise<string> {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const stored = await readJson<{ s?: string }>("secret", {});
  if (stored.s) return stored.s;
  const s = randomBytes(32).toString("hex");
  await writeJson("secret", { s });
  return s;
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  return safeEqual(createHmac("sha256", "pw").update(input).digest("hex"), createHmac("sha256", "pw").update(adminPassword()).digest("hex"));
}

export async function createSession() {
  const payload = String(Date.now() + TTL_MS);
  const token = `${payload}.${sign(payload, await secret())}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  if (!safeEqual(mac, sign(payload, await secret()))) return false;
  return Number(payload) > Date.now();
}

/** API rotaları için: oturum + (yazma isteklerinde) aynı-origin kontrolü. Hata varsa Response döner. */
export async function guard(method: string): Promise<NextResponse | null> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (method !== "GET") {
    const h = await headers();
    const origin = h.get("origin");
    const host = h.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: "Geçersiz origin" }, { status: 403 });
    }
  }
  return null;
}

const attempts = new Map<string, { n: number; until: number }>();
export function loginThrottle(ip: string): number {
  const a = attempts.get(ip);
  return a && a.until > Date.now() && a.n >= 5 ? Math.ceil((a.until - Date.now()) / 1000) : 0;
}
export function loginFailed(ip: string) {
  const a = attempts.get(ip);
  attempts.set(ip, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 5 * 60_000 });
}
export const loginOk = (ip: string) => attempts.delete(ip);
