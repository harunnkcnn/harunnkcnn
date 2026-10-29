"use client";
import { useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { Btn, Card, Field, Toast, api, inputCls, useToast } from "./ui";

export function SiteForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const { msg, show } = useToast();
  const setL = (k: "role" | "heroLine" | "about", v: string) => setS({ ...s, [k]: { ...s[k], [lang]: v } });
  const setSeoL = (k: "title" | "description", v: string) => setS({ ...s, seo: { ...s.seo, [k]: { ...s.seo[k], [lang]: v } } });
  async function save() {
    try { await api("/api/admin/settings", "PUT", { site: s }); show("ok", "Site ayarları kaydedildi"); } catch (e) { show("err", (e as Error).message); }
  }
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between"><h1 className="font-display text-4xl font-bold tracking-tight">Site ayarları</h1><Btn variant="solid" onClick={save}>Kaydet</Btn></div>
      <div className="flex gap-2">{(["tr", "en"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={`rounded-full border px-4 py-1 font-mono text-xs uppercase ${lang === l ? "border-acid bg-acid text-ink" : "border-line text-mute"}`}>{l}</button>)}</div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Kimlik">
          <Field label="Ad"><input className={inputCls} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></Field>
          <Field label={`Unvan (${lang})`}><input className={inputCls} value={s.role[lang]} onChange={(e) => setL("role", e.target.value)} /></Field>
          <Field label={`Hero cümlesi (${lang})`}><textarea rows={2} className={inputCls} value={s.heroLine[lang]} onChange={(e) => setL("heroLine", e.target.value)} /></Field>
          <Field label={`Hakkımda (${lang})`}><textarea rows={6} className={inputCls} value={s.about[lang]} onChange={(e) => setL("about", e.target.value)} /></Field>
        </Card>
        <div className="grid content-start gap-5">
          <Card title="Bağlantılar">
            <Field label="E-posta"><input className={inputCls} value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></Field>
            <Field label="LinkedIn"><input className={inputCls} value={s.linkedin} onChange={(e) => setS({ ...s, linkedin: e.target.value })} /></Field>
            <Field label="Behance"><input className={inputCls} value={s.behance} onChange={(e) => setS({ ...s, behance: e.target.value })} /></Field>
            <Field label="GitHub"><input className={inputCls} value={s.github} onChange={(e) => setS({ ...s, github: e.target.value })} /></Field>
          </Card>
          <Card title="Ana sayfa SEO">
            <Field label={`Başlık (${lang}) — ${s.seo.title[lang].length}/60`}><input className={inputCls} value={s.seo.title[lang]} onChange={(e) => setSeoL("title", e.target.value)} /></Field>
            <Field label={`Açıklama (${lang}) — ${s.seo.description[lang].length}/160`}><textarea rows={3} className={inputCls} value={s.seo.description[lang]} onChange={(e) => setSeoL("description", e.target.value)} /></Field>
            <Field label="Anahtar kelimeler"><input className={inputCls} value={s.seo.keywords.join(", ")} onChange={(e) => setS({ ...s, seo: { ...s.seo, keywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } })} /></Field>
          </Card>
        </div>
      </div>
      <Toast msg={msg} />
    </div>
  );
}
