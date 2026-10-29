"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import { dt } from "@/lib/i18n";

export function Nav({ lang, name }: { lang: Lang; name: string }) {
  const d = dt(lang);
  const path = usePathname() || `/${lang}`;
  const [open, setOpen] = useState(false);
  const other: Lang = lang === "tr" ? "en" : "tr";
  const switchHref = path.replace(/^\/(tr|en)/, `/${other}`);
  const links = [
    [`/${lang}#work`, d.navWork], [`/${lang}#services`, d.navServices],
    [`/${lang}/blog`, d.navBlog], [`/${lang}#contact`, d.navContact],
  ] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-ink/70 backdrop-blur-md">
      <nav aria-label="Ana menü" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href={`/${lang}`} className="font-display text-lg font-bold tracking-tight">
          {name}<span className="text-acid">.</span>
        </Link>
        <ul className="hidden items-center gap-8 text-sm md:flex">
          {links.map(([href, label]) => (
            <li key={href}><Link href={href} className="text-mute transition hover:text-paper">{label}</Link></li>
          ))}
          <li>
            <Link href={switchHref} hrefLang={other} className="rounded-full border border-line px-3 py-1 font-mono text-xs uppercase hover:border-acid hover:text-acid">
              {other}
            </Link>
          </li>
        </ul>
        <button className="md:hidden font-mono text-sm" aria-expanded={open} aria-controls="m-menu" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </nav>
      {open && (
        <ul id="m-menu" className="border-t border-line bg-ink px-5 py-4 md:hidden">
          {links.map(([href, label]) => (
            <li key={href}><Link onClick={() => setOpen(false)} href={href} className="block py-3 font-display text-2xl">{label}</Link></li>
          ))}
          <li><Link href={switchHref} className="block py-3 font-mono text-sm uppercase text-acid">{other}</Link></li>
        </ul>
      )}
    </header>
  );
}
