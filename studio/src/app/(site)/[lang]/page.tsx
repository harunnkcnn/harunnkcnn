import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { Magnetic, Reveal, SplitHero, SplitWords } from "@/components/Motion";
import { WorkGrid, type WorkItem } from "@/components/WorkGrid";
import { getSettings, listPublished } from "@/lib/content";
import { dt } from "@/lib/i18n";
import { coverUrl, isLang, t } from "@/lib/util";

const code = `const brief = await listen(client);
const system = design(brief);
ship(system, { seo: true, fast: true });`;

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = dt(lang);
  const [site, projects, services, posts] = await Promise.all([
    getSettings(), listPublished("projects"), listPublished("services"), listPublished("posts"),
  ]);
  const items: WorkItem[] = projects.map((p) => ({
    slug: p.slug, kind: p.kind, title: t(p.title, lang), summary: t(p.summary, lang), cover: coverUrl(p.cover, p.slug),
    year: p.year, tags: p.tags, alt: t(p.seo.altText, lang) || t(p.title, lang),
  }));
  const sw = services.filter((s) => s.kind === "software");
  const ds = services.filter((s) => s.kind === "design");
  const marquee = [...d.sectors, ...d.sectors];

  return (
    <>
      <section aria-labelledby="hero-h">
        <SplitHero
          hint={d.hint}
          left={
            <div className="flex h-full flex-col justify-between p-6 md:p-12">
              <pre aria-hidden className="font-mono text-xs leading-6 text-mute md:text-sm"><code>{code}</code></pre>
              <p aria-hidden className="font-display text-[clamp(3.5rem,15vw,13rem)] font-extrabold leading-[0.85] tracking-[-0.05em]">{d.code}</p>
            </div>
          }
          right={
            <div className="flex h-full flex-col items-end justify-between p-6 text-right md:p-12">
              <span aria-hidden className="font-mono text-xs uppercase tracking-[0.3em] md:text-sm">Logo · UI · Brand · Ads</span>
              <p aria-hidden className="font-display text-[clamp(3.5rem,15vw,13rem)] font-extrabold italic leading-[0.85] tracking-[-0.05em]">{d.design}</p>
            </div>
          }
        />
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-[1.4fr_1fr] md:px-8">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-acid">{t(site.role, lang)}</p>
            <h1 id="hero-h" className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              <SplitWords text={site.name} /> <span className="text-mute"><SplitWords text={t(site.heroLine, lang)} delay={0.2} /></span>
            </h1>
          </div>
          <div className="flex flex-col items-start justify-end gap-4 md:items-end">
            <Magnetic><Link href="#contact" className="inline-block rounded-full bg-acid px-7 py-4 font-semibold text-ink hover:bg-paper">{d.heroCta} →</Link></Magnetic>
            <Link href="#work" className="font-mono text-xs uppercase tracking-widest text-mute hover:text-acid">{d.heroCta2} ↓</Link>
          </div>
        </div>
      </section>

      <div aria-hidden className="overflow-hidden border-y border-line bg-ink-2 py-4">
        <div className="flex w-max animate-marquee gap-10 font-display text-3xl font-semibold uppercase tracking-tight text-line">
          {marquee.map((s, i) => <span key={i} className="whitespace-nowrap">{s} <span className="text-ember">✦</span></span>)}
        </div>
      </div>

      <section id="services" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8">
        <Reveal><h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{d.servicesTitle}</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-3 max-w-xl text-mute">{d.servicesSub}</p></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[[sw, d.code, "bg-ink-2 text-paper border-line"], [ds, d.design, "bg-acid text-ink border-acid"]].map(([list, label, cls], gi) => (
            <Reveal key={gi} delay={gi * 0.1}>
              <div className={`h-full rounded-3xl border p-7 ${cls as string}`}>
                <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-70">{label as string}</p>
                <ul className="mt-6 grid gap-4">
                  {(list as typeof sw).map((s) => (
                    <li key={s.id} className="flex gap-4 border-t border-current/15 pt-4">
                      <span aria-hidden className="w-7 shrink-0 text-center font-display text-2xl">{s.icon}</span>
                      <div>
                        <h3 className="font-display text-xl font-semibold tracking-tight">{t(s.title, lang)}</h3>
                        <p className="text-sm opacity-70">{t(s.summary, lang)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="work" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-24 md:px-8">
        <Reveal><h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{d.workTitle}</h2></Reveal>
        <Reveal delay={0.1}><p className="mb-10 mt-3 text-mute">{d.workSub}</p></Reveal>
        <WorkGrid items={items} lang={lang} />
      </section>

      <section aria-labelledby="proc" className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <h2 id="proc" className="font-display text-4xl font-bold tracking-tight md:text-6xl">{d.processTitle}</h2>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line md:grid-cols-4">
            {d.steps.map(([title, text], i) => (
              <li key={title} className="bg-ink-2 p-7 transition hover:bg-ink">
                <Reveal delay={i * 0.08}>
                  <span className="font-mono text-xs text-acid">0{i + 1}</span>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-mute">{text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{d.blogTitle}</h2>
            <Link href={`/${lang}/blog`} className="font-mono text-xs uppercase tracking-widest text-mute hover:text-acid">{d.blogAll} →</Link>
          </div>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {posts.slice(0, 3).map((p) => (
              <li key={p.id}>
                <Link href={`/${lang}/blog/${p.slug}`} data-hover className="group flex items-center justify-between gap-6 py-6">
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight transition group-hover:translate-x-2 group-hover:text-acid">{t(p.title, lang)}</h3>
                    <p className="mt-1 text-sm text-mute">{t(p.excerpt, lang)}</p>
                  </div>
                  <span aria-hidden className="text-2xl text-mute transition group-hover:text-acid">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-16 px-5 pb-28 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{d.aboutTitle}</h2>
          <p className="mt-6 max-w-prose text-lg leading-8 text-paper/80">{t(site.about, lang)}</p>
        </div>
        <div id="contact" className="scroll-mt-24 rounded-3xl border border-line bg-ink-2 p-7 md:p-10">
          <h2 className="font-display text-3xl font-bold tracking-tight">{d.contactTitle}</h2>
          <p className="mb-8 mt-2 text-mute">{d.contactSub}</p>
          <ContactForm lang={lang} />
        </div>
      </section>
    </>
  );
}
