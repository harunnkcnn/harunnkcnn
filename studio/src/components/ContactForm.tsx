"use client";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import { dt } from "@/lib/i18n";

export function ContactForm({ lang }: { lang: Lang }) {
  const d = dt(lang);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f)),
    }).catch(() => null);
    if (res?.ok) { setState("sent"); (e.target as HTMLFormElement).reset(); } else setState("failed");
  }
  const input = "w-full border-b border-line bg-transparent py-3 text-lg outline-none transition placeholder:text-mute focus:border-acid";
  return (
    <form onSubmit={submit} className="grid gap-6" noValidate={false}>
      <label className="grid gap-1 font-mono text-xs uppercase tracking-widest text-mute">{d.fName}
        <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={input} />
      </label>
      <label className="grid gap-1 font-mono text-xs uppercase tracking-widest text-mute">{d.fEmail}
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="grid gap-1 font-mono text-xs uppercase tracking-widest text-mute">{d.fBudget}
        <select name="budget" className={`${input} bg-ink`}>
          <option value="">—</option><option>₺10–25K</option><option>₺25–75K</option><option>₺75K+</option>
        </select>
      </label>
      <label className="grid gap-1 font-mono text-xs uppercase tracking-widest text-mute">{d.fText}
        <textarea name="text" required minLength={10} maxLength={4000} rows={4} className={input} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex items-center gap-4">
        <button disabled={state === "sending"} className="rounded-full bg-acid px-7 py-3 font-semibold text-ink transition hover:bg-paper disabled:opacity-60">
          {state === "sending" ? d.sending : d.send} →
        </button>
        <p role="status" className={`text-sm ${state === "failed" ? "text-ember" : "text-acid"}`}>
          {state === "sent" ? d.sent : state === "failed" ? d.failed : ""}
        </p>
      </div>
    </form>
  );
}
