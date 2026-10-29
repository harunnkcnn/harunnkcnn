"use client";
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper outline-none transition placeholder:text-mute/60 focus:border-acid";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-mute">{label}</span>
      {children}
      {hint && <span className="text-xs text-mute/80">{hint}</span>}
    </label>
  );
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-ink-2 p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function Btn({ variant = "ghost", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "ghost" | "solid" | "ai" | "danger" }) {
  const v = {
    ghost: "border border-line text-paper hover:border-paper",
    solid: "bg-acid text-ink hover:bg-paper font-semibold",
    ai: "border border-ember/60 text-ember hover:bg-ember hover:text-ink",
    danger: "border border-line text-mute hover:border-ember hover:text-ember",
  }[variant];
  return <button {...p} className={`rounded-full px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`} />;
}

export function Toast({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <div role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${msg.type === "ok" ? "border-acid bg-ink text-acid" : "border-ember bg-ink text-ember"}`}>
      {msg.text}
    </div>
  );
}

export async function api<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `İstek başarısız (${res.status})`);
  return data as T;
}

import { useCallback, useState } from "react";
export function useToast() {
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const show = useCallback((type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), type === "err" ? 7000 : 3000);
  }, []);
  return { msg, show };
}
