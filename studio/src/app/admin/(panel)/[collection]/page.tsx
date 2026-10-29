import Link from "next/link";
import { notFound } from "next/navigation";
import { list } from "@/lib/content";
import { LABELS } from "@/lib/blank";
import { analyzeSeo } from "@/lib/seo";
import { seoInputOf } from "@/lib/seoinput";
import type { Collection } from "@/lib/types";

export default async function ListPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!(collection in LABELS)) notFound();
  const c = collection as Collection;
  const items = await list(c);
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold tracking-tight">{LABELS[c].plural}</h1>
        <Link href={`/admin/${c}/new`} className="rounded-full bg-acid px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper">+ Yeni {LABELS[c].singular.toLowerCase()}</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-ink-2">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line font-mono text-[11px] uppercase tracking-widest text-mute">
            <tr><th className="p-4">Başlık</th><th className="p-4">Durum</th>{c !== "services" && <th className="p-4">SEO</th>}<th className="p-4">Güncelleme</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((e) => (
              <tr key={e.id} className="hover:bg-ink">
                <td className="p-4"><Link href={`/admin/${c}/${e.id}`} className="font-medium hover:text-acid">{e.title.tr}</Link><div className="font-mono text-xs text-mute">/{e.slug}</div></td>
                <td className="p-4">{e.published ? <span className="text-acid">● Yayında</span> : <span className="text-mute">○ Taslak</span>}</td>
                {c !== "services" && <td className="p-4 font-mono">{analyzeSeo(seoInputOf(e, "tr")).score}</td>}
                <td className="p-4 text-mute">{new Date(e.updatedAt).toLocaleDateString("tr-TR")}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-6 text-mute" colSpan={4}>Kayıt yok.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
