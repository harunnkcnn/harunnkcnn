"use client";
import { useRouter } from "next/navigation";
import type { Message } from "@/lib/types";
import { Btn, api } from "./ui";

export function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const act = async (fn: () => Promise<unknown>) => { await fn(); router.refresh(); };
  return (
    <ul className="grid gap-3">
      {messages.map((m) => (
        <li key={m.id} className={`rounded-2xl border p-5 ${m.read ? "border-line bg-ink-2" : "border-acid/60 bg-ink-2"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{m.name} <a className="text-acid" href={`mailto:${m.email}`}>&lt;{m.email}&gt;</a></p>
            <p className="font-mono text-xs text-mute">{new Date(m.createdAt).toLocaleString("tr-TR")}{m.budget && ` · ${m.budget}`}</p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-paper/85">{m.text}</p>
          <div className="mt-4 flex gap-2">
            <Btn onClick={() => act(() => api("/api/admin/messages", "PATCH", { id: m.id, read: !m.read }))}>{m.read ? "Okunmadı yap" : "Okundu"}</Btn>
            <Btn variant="danger" onClick={() => confirm("Mesaj silinsin mi?") && act(() => api(`/api/admin/messages?id=${m.id}`, "DELETE"))}>Sil</Btn>
          </div>
        </li>
      ))}
      {messages.length === 0 && <li className="text-mute">Henüz mesaj yok.</li>}
    </ul>
  );
}
