import { MessageList } from "@/components/admin/MessageList";
import { listMessages } from "@/lib/content";

export default async function MessagesPage() {
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Mesajlar</h1>
      <MessageList messages={await listMessages()} />
    </div>
  );
}
