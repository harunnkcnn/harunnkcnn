"use client";
import { useState } from "react";
import { analyzeSeo } from "@/lib/seo";
import { seoInputOf } from "@/lib/seoinput";
import type { Entity, Lang } from "@/lib/types";
import { ScoreRing } from "./SeoPanel";
import { Btn, Card, Toast, api, inputCls, useToast } from "./ui";

type Row = { entity: Entity; kind: "projects" | "posts" };
type Ai = { verdict?: string; issues?: string[]; rewrite?: { title?: string; description?: string; keywords?: string[] }; contentIdeas?: string[]; schema?: string };

export function SeoLab({ rows }: { rows: Row[] }) {
  const [lang, setLang] = useState<Lang>("tr");
  const [sel, setSel] = useState(rows[0]?.entity.id ?? "");
  const [ai, setAi] = useState<Ai | null>(null);
  const [busy, setBusy] = useState(false);
  const { msg, show } = useToast();
  const current = rows.find((r) => r.entity.id === sel);
  const report = current ? analyzeSeo(seoInputOf(current.entity, lang)) : null;

  async function deep() {
    if (!current) return;
    setBusy(true);
    try { setAi((await api<{ ai: Ai }>("/api/admin/ai/seo", "POST", { ...seoInputOf(current.entity, lang), deep: true })).ai); }
    catch (e) { show("err", (e as Error).message); }
    setBusy(false);
  }
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">SEO Lab</h1>
      <div className="flex flex-wrap gap-3">
        <select className={`${inputCls} max-w-sm`} value={sel} onChange={(e) => { setSel(e.target.value); setAi(null); }}>
          {rows.map((r) => <option key={r.entity.id} value={r.entity.id}>{r.kind === "projects" ? "Proje" : "Yazı"} · {r.entity.title.tr}</option>)}
        </select>
        {(["tr", "en"] as Lang[]).map((l) => <button key={l} onClick={() => { setLang(l); setAi(null); }} className={`rounded-full border px-4 font-mono text-xs uppercase ${lang === l ? "border-acid bg-acid text-ink" : "border-line text-mute"}`}>{l}</button>)}
        <Btn variant="ai" disabled={busy || !current} onClick={deep}>{busy ? "Claude analiz ediyor…" : "✦ Claude ile derin analiz"}</Btn>
      </div>
      {report && current && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Temel kontroller (anında, ücretsiz)">
            <div className="flex items-center gap-4"><ScoreRing score={report.score} /><p className="text-sm text-mute">{report.words} kelime</p></div>
            <ul className="grid gap-2 text-sm">
              {report.checks.map((c) => <li key={c.id} className={c.ok ? "text-acid" : "text-paper"}>{c.ok ? "✓" : "✕"} {c.label}{!c.ok && <span className="block pl-5 text-xs text-mute">{c.hint}</span>}</li>)}
            </ul>
            <a href={`/admin/${current.kind}/${current.entity.id}`} className="text-sm text-acid hover:underline">Düzenleyiciyi aç →</a>
          </Card>
          <Card title="Claude analizi">
            {!ai && <p className="text-sm text-mute">Derin analiz için yukarıdaki düğmeye basın (Claude API anahtarı gerekir).</p>}
            {ai && (
              <div className="grid gap-3 text-sm">
                <p>{ai.verdict}</p>
                <ul className="list-disc pl-5 text-mute">{ai.issues?.map((i, n) => <li key={n}>{i}</li>)}</ul>
                {ai.rewrite && <div className="rounded-lg border border-line p-3"><p><b>Başlık:</b> {ai.rewrite.title}</p><p className="mt-1"><b>Açıklama:</b> {ai.rewrite.description}</p><p className="mt-1 text-mute">{ai.rewrite.keywords?.join(", ")}</p></div>}
                {ai.contentIdeas && <ul className="list-disc pl-5">{ai.contentIdeas.map((i, n) => <li key={n}>{i}</li>)}</ul>}
                {ai.schema && <p className="text-mute">Schema: {ai.schema}</p>}
              </div>
            )}
          </Card>
        </div>
      )}
      <Toast msg={msg} />
    </div>
  );
}
