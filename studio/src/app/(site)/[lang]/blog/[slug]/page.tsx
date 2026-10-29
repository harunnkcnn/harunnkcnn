import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getBySlug, getSettings, listPublished } from "@/lib/content";
import { dt } from "@/lib/i18n";
import { renderMd } from "@/lib/md";
import { SITE_URL, coverUrl, isLang, t } from "@/lib/util";

type P = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const all = await listPublished("posts");
  return ["tr", "en"].flatMap((lang) => all.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = isLang(lang) ? await getBySlug("posts", slug) : null;
  if (!p || !isLang(lang)) return {};
  const title = t(p.seo.title, lang) || t(p.title, lang);
  const description = t(p.seo.description, lang) || t(p.excerpt, lang);
  return {
    title, description, keywords: p.seo.keywords,
    alternates: { canonical: `/${lang}/blog/${p.slug}`, languages: { tr: `/tr/blog/${p.slug}`, en: `/en/blog/${p.slug}` } },
    openGraph: { type: "article", title, description, publishedTime: p.createdAt, modifiedTime: p.updatedAt, images: [{ url: p.cover || `/api/og?title=${encodeURIComponent(t(p.title, lang))}` }] },
  };
}

export default async function Post({ params }: P) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const p = await getBySlug("posts", slug);
  if (!p) notFound();
  const [d, site] = [dt(lang), await getSettings()];
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BlogPosting", headline: t(p.title, lang), description: t(p.excerpt, lang),
        image: `${SITE_URL}${coverUrl(p.cover, p.slug)}`, datePublished: p.createdAt, dateModified: p.updatedAt, inLanguage: lang,
        author: { "@type": "Person", name: site.name }, mainEntityOfPage: `${SITE_URL}/${lang}/blog/${p.slug}`,
      }} />
      <Link href={`/${lang}/blog`} className="font-mono text-xs uppercase tracking-widest text-mute hover:text-acid">← {d.blogTitle}</Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">{t(p.title, lang)}</h1>
      <time dateTime={p.createdAt} className="mt-4 block font-mono text-xs uppercase tracking-widest text-mute">{new Date(p.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { dateStyle: "long" })}</time>
      <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-3xl border border-line">
        <Image src={coverUrl(p.cover, p.slug)} alt={t(p.seo.altText, lang) || t(p.title, lang)} fill priority unoptimized sizes="100vw" className="object-cover" />
      </div>
      <div className="prose-studio mt-12" dangerouslySetInnerHTML={{ __html: renderMd(t(p.body, lang)) }} />
    </article>
  );
}
