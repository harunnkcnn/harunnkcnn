import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/jetbrains-mono";
import "../../globals.css";
import { Nav } from "@/components/SiteChrome";
import { PageTransition } from "@/components/PageTransition";
import { Cursor, ScrollProgress } from "@/components/Motion";
import { JsonLd } from "@/components/JsonLd";
import { getSettings } from "@/lib/content";
import { dt } from "@/lib/i18n";
import { SITE_URL, isLang, t } from "@/lib/util";

export const generateStaticParams = () => [{ lang: "tr" }, { lang: "en" }];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t(s.seo.title, lang), template: `%s · ${s.name}` },
    description: t(s.seo.description, lang),
    keywords: s.seo.keywords,
    alternates: { canonical: `/${lang}`, languages: { tr: "/tr", en: "/en", "x-default": "/tr" } },
    openGraph: { type: "website", siteName: s.name, locale: lang === "tr" ? "tr_TR" : "en_US", images: [{ url: "/api/og", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const s = await getSettings();
  const d = dt(lang);
  return (
    <html lang={lang}>
      <body className="grain min-h-screen antialiased">
        <JsonLd data={{
          "@context": "https://schema.org", "@type": "Person", name: s.name, jobTitle: t(s.role, lang), url: `${SITE_URL}/${lang}`,
          description: t(s.seo.description, lang), sameAs: [s.linkedin, s.behance, s.github].filter(Boolean),
        }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded focus:bg-acid focus:px-3 focus:py-2 focus:text-ink">{d.skip}</a>
        <ScrollProgress />
        <Cursor />
        <Nav lang={lang} name={s.name} />
        <main id="main" className="pt-16"><PageTransition>{children}</PageTransition></main>
        <footer className="border-t border-line px-5 py-10 text-sm text-mute md:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} {s.name} · {d.tagline}</p>
            <p className="flex gap-5">
              {s.linkedin && <a className="hover:text-acid" href={s.linkedin} rel="me noopener">LinkedIn</a>}
              {s.behance && <a className="hover:text-acid" href={s.behance} rel="me noopener">Behance</a>}
              {s.github && <a className="hover:text-acid" href={s.github} rel="me noopener">GitHub</a>}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
