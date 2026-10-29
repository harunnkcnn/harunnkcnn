import Link from "next/link";
import { ScoreRing } from "@/components/admin/SeoPanel";
import { getAiSettings, getLog } from "@/lib/ai";
import { list, listMessages } from "@/lib/content";
import { analyzeSeo } from "@/lib/seo";
import { seoInputOf } from "@/lib/seoinput";

export default async function Dashboard() {
  const [projects, posts, services, messages, ai, log] = await Promise.all([
    list("projects"), list("posts"), list("services"), listMessages(), getAiSettings(), getLog(),
  ]);
  const scored = [...projects, ...posts].map((e) => ({ e, r: analyzeSeo(seoInputOf(e, "tr")) }));
  const avg = scored.length ? Math.round(scored.reduce((a, s) => a + s.r.score, 0) / scored.length) : 0;
  const weak = scored.sort((a, b) => a.r.score - b.r.score).slice(0, 4);
  const stat = (label: string, value: number | string, href: string) => (
    <Link href={href} className="rounded-2xl border border-line bg-ink-2 p-5 transition hover:border-acid">
      <p className="font-mono text-[11px] uppercase tracking-widest text-mute">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
    </Link>
  );
  const calls = log.length, fails = log.filter((l) => !l.ok).length;
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Genel bakış</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Projeler", projects.length, "/admin/projects")}
        {stat("Yazılar", posts.length, "/admin/posts")}
        {stat("Hizmetler", services.length, "/admin/services")}
        {stat("Okunmamış mesaj", messages.filter((m) => !m.read).length, "/admin/messages")}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-ink-2 p-5 lg:col-span-2">
          <div className="flex items-center gap-4">
            <ScoreRing score={avg} />
            <div>
              <h2 className="font-display text-lg font-semibold">Ortalama SEO skoru (TR)</h2>
              <p className="text-sm text-mute">En zayıf içerikler aşağıda — açıp “AI ile doldur” demek çoğunu çözer.</p>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {weak.map(({ e, r }) => (
              <li key={e.id}>
                <Link href={`/admin/${"kind" in e ? "projects" : "posts"}/${e.id}`} className="flex items-center justify-between py-3 text-sm hover:text-acid">
                  <span>{e.title.tr}</span><span className="font-mono text-mute">{r.score}/100</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-ink-2 p-5">
          <h2 className="font-display text-lg font-semibold">AI durumu</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex justify-between"><span>Claude ({ai.claudeModel})</span><span className={ai.claudeKey ? "text-acid" : "text-ember"}>{ai.claudeKey ? "bağlı" : "anahtar yok"}</span></li>
            <li className="flex justify-between"><span>Görsel ({ai.imageModel})</span><span className={ai.openaiKey ? "text-acid" : "text-ember"}>{ai.openaiKey ? "bağlı" : "anahtar yok"}</span></li>
            <li className="flex justify-between text-mute"><span>Son {calls} çağrı</span><span>{fails} hata</span></li>
          </ul>
          <Link href="/admin/ai" className="mt-5 inline-block text-sm text-acid hover:underline">API yönetimi →</Link>
        </section>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/projects/new" className="rounded-full bg-acid px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper">+ Yeni proje</Link>
        <Link href="/admin/posts/new" className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-acid">+ Yeni yazı</Link>
        <Link href="/admin/seo" className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-acid">SEO Lab</Link>
      </div>
    </div>
  );
}
