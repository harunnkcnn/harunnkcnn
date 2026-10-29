"use client";
import { useState } from "react";
import type { SeoReport } from "@/lib/seo";
import { seoInputOf } from "@/lib/seoinput";
import type { Entity, Lang } from "@/lib/types";
import { Btn, Card, Field, api, inputCls } from "./ui";

type Ai = { verdict?: string; issues?: string[]; rewrite?: { title?: string; description?: string; keywords?: string[] }; contentIdeas?: string[]; schema?: string };

export function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "var(--color-acid)" : score >= 50 ? "#ffd23a" : "var(--color-ember)";
  return (
    <div role="img" aria-label={`SEO skoru ${score}/100`} className="grid h-20 w-20 shrink-0 place-items-center rounded-full font-display text-2xl font-bold"
      style={{ background: `conic-gradient(${color} ${score * 3.6}deg, var(--color-line) 0)` }}>
      <span className="grid h-[62px] w-[62px] place-items-center rounded-full bg-ink-2">{score}</span>
    </div>
  );
}

export function SeoPanel({ lang, entity, report, setSeo, setSeoL, setSlug, toast }: {
  lang: Lang; entity: Entity & Record<string, any>; report: SeoReport;
  setSeo: (p: Record<string, unknown>) => void; setSeoL: (k: "title" | "description" | "altText", v: string) => void;
  setSlug: (s: string) => void; toast: (t: "ok" | "err", s: string) => void;
}) {
  const [ai, setAi] = useState<Ai | null>(null);
  const [busy, setBusy] = useState(false);
  const seo = entity.seo;
  async function deep() {
    setBusy(true);
    try {
      const r = await api<{ ai: Ai | null }>("/api/admin/ai/seo", "POST", { ...seoInputOf(entity, lang), deep: true });
      setAi(r.ai);
    } catch (e) { toast("err", (e as Error).message); }
    setBusy(false);
  }
  return (
    <Card title="SEO" actions={<Btn variant="ai" disabled={busy} onClick={deep}>{busy ? "Claude analiz ediyor…" : "✦ Claude SEO analizi"}</Btn>}>
      <div className="flex items-center gap-4">
        <ScoreRing score={report.score} />
        <ul className="grid flex-1 gap-1 text-sm">
          {report.checks.filter((c) => !c.ok).slice(0, 4).map((c) => <li key={c.id} className="text-ember">✕ {c.hint}</li>)}
          {report.checks.every((c) => c.ok) && <li className="text-acid">✓ Tüm temel kontroller geçti</li>}
        </ul>
      </div>
      <Field label={`SEO başlığı (${lang}) — ${seo.title[lang].length}/60`}>
        <input className={inputCls} value={seo.title[lang]} onChange={(e) => setSeoL("title", e.target.value)} />
      </Field>
      <Field label={`Meta açıklama (${lang}) — ${seo.description[lang].length}/160`}>
        <textarea className={inputCls} rows={3} value={seo.description[lang]} onChange={(e) => setSeoL("description", e.target.value)} />
      </Field>
      <Field label="Anahtar kelimeler" hint="Virgülle ayırın — ilki ana kelimedir">
        <input className={inputCls} value={seo.keywords.join(", ")} onChange={(e) => setSeo({ keywords: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
      </Field>
      <Field label={`Görsel alt metni (${lang})`}>
        <input className={inputCls} value={seo.altText[lang]} onChange={(e) => setSeoL("altText", e.target.value)} />
      </Field>
      {ai && (
        <div className="grid gap-3 rounded-xl border border-ember/40 bg-ink p-4 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ember">Claude değerlendirmesi</p>
          {ai.verdict && <p>{ai.verdict}</p>}
          {ai.issues && <ul className="list-disc pl-5 text-mute">{ai.issues.map((i, n) => <li key={n}>{i}</li>)}</ul>}
          {ai.rewrite && (
            <div className="grid gap-2 rounded-lg border border-line p-3">
              <p><span className="text-mute">Önerilen başlık:</span> {ai.rewrite.title}</p>
              <p><span className="text-mute">Önerilen açıklama:</span> {ai.rewrite.description}</p>
              <Btn variant="solid" className="justify-self-start" onClick={() => {
                if (ai.rewrite?.title) setSeoL("title", ai.rewrite.title);
                if (ai.rewrite?.description) setSeoL("description", ai.rewrite.description);
                if (ai.rewrite?.keywords?.length) setSeo({ keywords: ai.rewrite.keywords });
                toast("ok", "Öneriler forma uygulandı");
              }}>Önerileri uygula</Btn>
            </div>
          )}
          {ai.contentIdeas && <div><p className="text-mute">İçerik fikirleri</p><ul className="list-disc pl-5">{ai.contentIdeas.map((i, n) => <li key={n}>{i}</li>)}</ul></div>}
          {ai.schema && <p className="text-mute">Schema: {ai.schema}</p>}
        </div>
      )}
    </Card>
  );
}
