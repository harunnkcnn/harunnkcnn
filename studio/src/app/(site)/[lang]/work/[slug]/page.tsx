import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Reveal, SplitWords } from "@/components/Motion";
import { getBySlug, getSettings, listPublished } from "@/lib/content";
import { dt } from "@/lib/i18n";
import { renderMd } from "@/lib/md";
import { SITE_URL, coverUrl, isLang, t } from "@/lib/util";

type P = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const all = await listPublished("projects");
  return ["tr", "en"].flatMap((lang) => all.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = isLang(lang) ? await getBySlug("projects", slug) : null;
  if (!p || !isLang(lang)) return {};
  const title = t(p.seo.title, lang) || t(p.title, lang);
  const description = t(p.seo.description, lang) || t(p.summary, lang);
  const img = coverUrl(p.cover, p.slug);
  return {
    title, description, keywords: p.seo.keywords,
    alternates: { canonical: `/${lang}/work/${p.slug}`, languages: { tr: `/tr/work/${p.slug}`, en: `/en/work/${p.slug}` } },
    openGraph: { type: "article", title, description, images: [{ url: p.cover ? img : `/api/og?title=${encodeURIComponent(t(p.title, lang))}` }] },
  };
}

export default async function Work({ params }: P) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const p = await getBySlug("projects", slug);
  if (!p) notFound();
  const [d, site] = [dt(lang), await getSettings()];
  const all = await listPublished("projects");
  const next = all[(all.findIndex((x) => x.id === p.id) + 1) % all.length];
  return (
    <article className="mx-auto max-w-5xl px-5 py-16 md:px-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CreativeWork", name: t(p.title, lang), description: t(p.summary, lang),
        image: `${SITE_URL}${coverUrl(p.cover, p.slug)}`, author: { "@type": "Person", name: site.name },
        datePublished: p.createdAt, dateModified: p.updatedAt, keywords: p.tags.join(", "), inLanguage: lang,
      }} />
      <nav aria-label="breadcrumb" className="font-mono text-xs uppercase tracking-widest text-mute">
        <Link href={`/${lang}#work`} className="hover:text-acid">← {d.navWork}</Link>
      </nav>
      <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-8xl">
        <SplitWords text={t(p.title, lang)} />
      </h1>
      <p className="mt-6 max-w-2xl text-xl text-mute">{t(p.summary, lang)}</p>
      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-y border-line py-4 font-mono text-xs uppercase tracking-widest">
        <div><dt className="text-mute">{d.year}</dt><dd>{p.year}</dd></div>
        <div><dt className="text-mute">Tür</dt><dd>{p.kind === "software" ? d.code : d.design}</dd></div>
        {p.tags.length > 0 && <div><dt className="text-mute">{d.tags}</dt><dd>{p.tags.join(" · ")}</dd></div>}
        {p.url && <div><dt className="text-mute">URL</dt><dd><a className="text-acid" href={p.url} rel="noopener">{d.visit} ↗</a></dd></div>}
      </dl>
      <Reveal className="relative mt-10 aspect-[3/2] overflow-hidden rounded-3xl border border-line">
        <Image src={coverUrl(p.cover, p.slug)} alt={t(p.seo.altText, lang) || t(p.title, lang)} fill priority unoptimized sizes="100vw" className="object-cover" />
      </Reveal>
      <div className="prose-studio mt-12" dangerouslySetInnerHTML={{ __html: renderMd(t(p.body, lang)) }} />
      {next && next.id !== p.id && (
        <Link href={`/${lang}/work/${next.slug}`} data-hover className="group mt-20 block border-t border-line pt-8">
          <span className="font-mono text-xs uppercase tracking-widest text-mute">Next →</span>
          <span className="mt-2 block font-display text-4xl font-bold tracking-tight transition group-hover:translate-x-3 group-hover:text-acid md:text-6xl">{t(next.title, lang)}</span>
        </Link>
      )}
    </article>
  );
}
