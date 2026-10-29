import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublished } from "@/lib/content";
import { dt } from "@/lib/i18n";
import { isLang, t } from "@/lib/util";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: dt(lang).blogTitle,
    alternates: { canonical: `/${lang}/blog`, languages: { tr: "/tr/blog", en: "/en/blog" } },
  };
}

export default async function Blog({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [d, posts] = [dt(lang), await listPublished("posts")];
  return (
    <section className="mx-auto max-w-4xl px-5 py-16 md:px-8">
      <h1 className="font-display text-5xl font-extrabold tracking-tight md:text-8xl">{d.blogTitle}</h1>
      {posts.length === 0 && <p className="mt-10 text-mute">{d.empty}</p>}
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/${lang}/blog/${p.slug}`} data-hover className="group block py-8">
              <time dateTime={p.createdAt} className="font-mono text-xs uppercase tracking-widest text-mute">{new Date(p.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { dateStyle: "long" })}</time>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight transition group-hover:translate-x-2 group-hover:text-acid">{t(p.title, lang)}</h2>
              <p className="mt-2 text-mute">{t(p.excerpt, lang)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
