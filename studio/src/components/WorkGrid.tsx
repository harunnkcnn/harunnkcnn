"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Kind } from "@/lib/types";
import { dt } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export type WorkItem = { slug: string; kind: Kind; title: string; summary: string; cover: string; year: string; tags: string[]; alt: string };

export function WorkGrid({ items, lang }: { items: WorkItem[]; lang: Lang }) {
  const d = dt(lang);
  const [kind, setKind] = useState<Kind | "all">("all");
  const shown = items.filter((i) => kind === "all" || i.kind === kind);
  const tabs: [Kind | "all", string][] = [["all", d.all], ["software", d.code], ["design", d.design]];
  return (
    <div>
      <div role="tablist" aria-label={d.workTitle} className="mb-8 flex gap-2">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition ${kind === k ? "border-acid bg-acid text-ink" : "border-line text-mute hover:border-paper hover:text-paper"}`}>
            {label}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-mute">{d.empty}</p>}
      <motion.ul layout className="grid gap-5 md:grid-cols-12">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.li
              layout key={p.slug}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={i % 4 === 0 || i % 4 === 3 ? "md:col-span-7" : "md:col-span-5"}
            >
              <Link href={`/${lang}/work/${p.slug}`} data-hover className="group relative block overflow-hidden rounded-2xl border border-line bg-ink-2">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image src={p.cover} alt={p.alt} fill sizes="(min-width:768px) 50vw, 100vw" unoptimized
                    className="object-cover transition duration-700 group-hover:scale-105 group-hover:rotate-[0.6deg]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-acid backdrop-blur">
                    {p.kind === "software" ? d.code : d.design} · {p.year}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-mute">{p.summary}</p>
                  <p className="mt-4 translate-y-1 font-mono text-xs uppercase tracking-widest text-acid opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    {d.viewCase} →
                  </p>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
