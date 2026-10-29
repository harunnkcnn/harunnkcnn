"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }),
    });
    if (res.ok) { router.replace("/admin"); router.refresh(); return; }
    setErr(((await res.json().catch(() => ({}))) as { error?: string }).error || "Giriş başarısız");
    setBusy(false);
  }
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-ink-2 p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">Studio Admin</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Giriş</h1>
        <label className="mt-8 grid gap-2 text-sm text-mute">Şifre
          <input name="password" type="password" required autoFocus autoComplete="current-password"
            className="rounded-lg border border-line bg-ink px-3 py-3 text-paper outline-none focus:border-acid" />
        </label>
        {err && <p role="alert" className="mt-3 text-sm text-ember">{err}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-acid py-3 font-semibold text-ink hover:bg-paper disabled:opacity-60">
          {busy ? "…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
