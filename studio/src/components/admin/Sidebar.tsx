"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  ["/admin", "Genel bakış", "◉"],
  ["/admin/projects", "Projeler", "▣"],
  ["/admin/posts", "Yazılar", "✎"],
  ["/admin/services", "Hizmetler", "◈"],
  ["/admin/seo", "SEO Lab", "⌕"],
  ["/admin/messages", "Mesajlar", "✉"],
  ["/admin/site", "Site ayarları", "⚙"],
  ["/admin/ai", "AI & API", "✦"],
] as const;

export function Sidebar({ unread }: { unread: number }) {
  const path = usePathname();
  const router = useRouter();
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-ink-2 p-4 max-md:hidden">
      <p className="px-3 pb-6 pt-2 font-display text-xl font-bold">Studio<span className="text-acid">.</span>admin</p>
      <nav aria-label="Yönetim" className="grid gap-1">
        {items.map(([href, label, icon]) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${active ? "bg-acid text-ink" : "text-mute hover:bg-ink hover:text-paper"}`}>
              <span><span aria-hidden className="mr-2">{icon}</span>{label}</span>
              {href === "/admin/messages" && unread > 0 && <span className="rounded-full bg-ember px-2 text-xs text-ink">{unread}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto grid gap-2 text-sm">
        <a href="/tr" target="_blank" className="rounded-lg px-3 py-2 text-mute hover:text-acid">Siteyi aç ↗</a>
        <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }}
          className="rounded-lg px-3 py-2 text-left text-mute hover:text-ember">Çıkış</button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const path = usePathname();
  return (
    <nav aria-label="Yönetim (mobil)" className="flex gap-2 overflow-x-auto border-b border-line bg-ink-2 p-3 md:hidden">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${path === href || (href !== "/admin" && path.startsWith(href)) ? "bg-acid text-ink" : "text-mute"}`}>{label}</Link>
      ))}
    </nav>
  );
}
