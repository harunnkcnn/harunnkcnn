"use client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { analyzeSeo, type SeoReport } from "@/lib/seo";
import { seoInputOf } from "@/lib/seoinput";
import { LABELS } from "@/lib/blank";
import { slugify } from "@/lib/slug";
import type { Collection, Entity, L, Lang } from "@/lib/types";
import { Btn, Card, Field, Toast, api, inputCls, useToast } from "./ui";
import { SeoPanel } from "./SeoPanel";

type E = Entity & Record<string, any>;

function ImageField({ value, onChange, title, summary, toast }: { value: string; onChange: (v: string) => void; title: string; summary: string; toast: (t: "ok" | "err", s: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState<"" | "up" | "gen">("");
  const file = useRef<HTMLInputElement>(null);
  async function upload(f: File) {
    setBusy("up");
    const fd = new FormData();
    fd.set("file", f);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setBusy("");
    if (res.ok) onChange(j.url); else toast("err", j.error || "Yükleme başarısız");
  }
  async function generate(craft: boolean) {
    setBusy("gen");
    try {
      const r = await api<{ url: string; prompt: string }>("/api/admin/ai/image", "POST", { prompt, title, summary, craft });
      onChange(r.url);
      setPrompt(r.prompt);
      toast("ok", "Görsel üretildi");
    } catch (e) { toast("err", (e as Error).message); }
    setBusy("");
  }
  return (
    <div className="grid gap-3">
      <div className="grid aspect-[3/2] max-w-md place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-ink">
        {value ? <img src={value} alt="Kapak önizleme" className="h-full w-full object-cover" /> : <span className="text-sm text-mute">Kapak yok — otomatik üretken kapak kullanılır</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Btn type="button" onClick={() => file.current?.click()} disabled={!!busy}>{busy === "up" ? "Yükleniyor…" : "Görsel yükle"}</Btn>
        {value && <Btn type="button" variant="danger" onClick={() => onChange("")}>Kaldır</Btn>}
      </div>
      <Field label="AI görsel promptu (ChatGPT image)" hint="Boş bırakırsan başlık/özetten Claude (anahtar varsa) prompt yazar.">
        <textarea className={inputCls} rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Örn: karanlık zeminde asit yeşili geometrik kompozisyon, depo paneli konsepti" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Btn type="button" variant="ai" disabled={!!busy} onClick={() => generate(false)}>{busy === "gen" ? "Üretiliyor…" : "✦ Görsel üret"}</Btn>
        <Btn type="button" variant="ai" disabled={!!busy} onClick={() => generate(true)}>✦ Claude prompt yazsın, üret</Btn>
      </div>
    </div>
  );
}

export function EntityEditor({ collection, initial }: { collection: Collection; initial: Entity }) {
  const router = useRouter();
  const [e, setE] = useState<E>(initial as E);
  const [lang, setLang] = useState<Lang>("tr");
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const { msg, show } = useToast();
  const label = LABELS[collection];
  const isNew = !initial.id;
  const hasSeo = collection !== "services";
  const bodyKey = collection === "posts" ? "excerpt" : "summary";
  const report: SeoReport | null = useMemo(() => (hasSeo ? analyzeSeo(seoInputOf(e, lang)) : null), [e, lang, hasSeo]);

  const set = (patch: Partial<E>) => setE((p) => ({ ...p, ...patch }) as E);
  const setL = (key: string, v: string) => set({ [key]: { ...(e[key] as L), [lang]: v } });
  const setSeo = (patch: Record<string, unknown>) => set({ seo: { ...e.seo, ...patch } });
  const setSeoL = (key: "title" | "description" | "altText", v: string) => setSeo({ [key]: { ...e.seo[key], [lang]: v } });

  async function save(publish?: boolean) {
    setSaving(true);
    try {
      const body = publish === undefined ? e : { ...e, published: publish };
      const saved = await api<Entity>(`/api/admin/entity/${collection}`, "PUT", body);
      setE(saved as E);
      show("ok", "Kaydedildi");
      if (isNew) router.replace(`/admin/${collection}/${saved.id}`);
      router.refresh();
    } catch (err) { show("err", (err as Error).message); }
    setSaving(false);
  }

  async function aiFill(overwrite: boolean) {
    if (overwrite && !confirm("Dolu alanların üzerine yazılacak. Devam edilsin mi?")) return;
    setAiBusy(true);
    try {
      const next = await api<E>("/api/admin/ai/fill", "POST", { collection, entry: e, overwrite });
      setE(next);
      show("ok", "AI alanları doldurdu — kontrol edip kaydedin");
    } catch (err) { show("err", (err as Error).message); }
    setAiBusy(false);
  }

  async function del() {
    if (!confirm(`"${e.title.tr}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    await api(`/api/admin/entity/${collection}?id=${e.id}`, "DELETE");
    router.replace(`/admin/${collection}`);
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mute">{label.plural}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">{isNew ? `Yeni ${label.singular.toLowerCase()}` : e.title.tr || "Başlıksız"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="ai" disabled={aiBusy || !e.title.tr} onClick={() => aiFill(false)} title={e.title.tr ? "" : "Önce Türkçe başlık yazın"}>{aiBusy ? "Claude çalışıyor…" : "✦ AI ile doldur (boşlar)"}</Btn>
          <Btn variant="ai" disabled={aiBusy || !e.title.tr} onClick={() => aiFill(true)}>↻ Üzerine yaz</Btn>
          <Btn disabled={saving} onClick={() => save()}>Kaydet</Btn>
          <Btn variant="solid" disabled={saving} onClick={() => save(!e.published)}>{e.published ? "Yayından kaldır" : "Yayınla"}</Btn>
        </div>
      </div>

      <div role="tablist" aria-label="Dil" className="flex gap-2">
        {(["tr", "en"] as Lang[]).map((l) => (
          <button key={l} role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`rounded-full border px-4 py-1 font-mono text-xs uppercase ${lang === l ? "border-acid bg-acid text-ink" : "border-line text-mute"}`}>{l}</button>
        ))}
        <span className="self-center text-xs text-mute">{e.published ? "● Yayında" : "○ Taslak"}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid content-start gap-5">
          <Card title="İçerik">
            <Field label={`Başlık (${lang})`}>
              <input className={inputCls} value={e.title[lang]} onChange={(ev) => setL("title", ev.target.value)} />
            </Field>
            <Field label={`${collection === "posts" ? "Özet" : "Kısa açıklama"} (${lang})`}>
              <textarea className={inputCls} rows={2} value={e[bodyKey]?.[lang] ?? ""} onChange={(ev) => setL(bodyKey, ev.target.value)} />
            </Field>
            {collection !== "services" && (
              <Field label={`İçerik — markdown (${lang})`} hint="## Başlık, - liste, **kalın**, [bağlantı](https://…)">
                <textarea className={`${inputCls} font-mono`} rows={14} value={e.body[lang]} onChange={(ev) => setL("body", ev.target.value)} />
              </Field>
            )}
            {collection === "services" && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="İkon (tek karakter)"><input className={inputCls} maxLength={2} value={e.icon} onChange={(ev) => set({ icon: ev.target.value })} /></Field>
                <Field label="Sıra"><input type="number" className={inputCls} value={e.order} onChange={(ev) => set({ order: Number(ev.target.value) })} /></Field>
              </div>
            )}
          </Card>

          {hasSeo && (
            <>
              <Card title="Görsel"><ImageField value={e.cover} onChange={(v) => set({ cover: v })} title={e.title.tr} summary={e[bodyKey]?.tr ?? ""} toast={show} /></Card>
              <SeoPanel lang={lang} entity={e} report={report!} setSeo={setSeo} setSeoL={setSeoL} setSlug={(s) => set({ slug: s })} toast={show} />
            </>
          )}
        </div>

        <aside className="grid content-start gap-5">
          <Card title="Ayarlar">
            {"kind" in e && (
              <Field label="Tür">
                <select className={inputCls} value={e.kind} onChange={(ev) => set({ kind: ev.target.value })}>
                  <option value="software">Yazılım</option><option value="design">Tasarım</option>
                </select>
              </Field>
            )}
            {collection === "projects" && (
              <>
                <Field label="Yıl"><input className={inputCls} value={e.year} onChange={(ev) => set({ year: ev.target.value })} /></Field>
                <Field label="Müşteri (isteğe bağlı)"><input className={inputCls} value={e.client} onChange={(ev) => set({ client: ev.target.value })} /></Field>
                <Field label="Canlı bağlantı"><input className={inputCls} placeholder="https://" value={e.url} onChange={(ev) => set({ url: ev.target.value })} /></Field>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={e.featured} onChange={(ev) => set({ featured: ev.target.checked })} /> Öne çıkan</label>
              </>
            )}
            {"tags" in e && (
              <Field label="Etiketler" hint="Virgülle ayırın">
                <input className={inputCls} value={e.tags.join(", ")} onChange={(ev) => set({ tags: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              </Field>
            )}
            <Field label="Slug (URL)">
              <input className={inputCls} value={e.slug} placeholder="otomatik" onChange={(ev) => set({ slug: slugify(ev.target.value) })} />
            </Field>
          </Card>
          {!isNew && <Btn variant="danger" onClick={del}>Sil</Btn>}
        </aside>
      </div>
      <Toast msg={msg} />
    </div>
  );
}
