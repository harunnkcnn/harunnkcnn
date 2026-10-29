import { redirect } from "next/navigation";
import { MobileNav, Sidebar } from "@/components/admin/Sidebar";
import { isAdmin, adminPassword, DEFAULT_PASSWORD } from "@/lib/auth";
import { listMessages } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const unread = (await listMessages()).filter((m) => !m.read).length;
  return (
    <div className="flex min-h-screen max-md:flex-col">
      <Sidebar unread={unread} />
      <MobileNav />
      <div className="min-w-0 flex-1">
        {adminPassword() === DEFAULT_PASSWORD && (
          <p role="alert" className="bg-ember px-5 py-2 text-sm font-medium text-ink">
            Varsayılan şifre kullanılıyor. <code>.env</code> dosyasında ADMIN_PASSWORD tanımlayın.
          </p>
        )}
        <div className="mx-auto max-w-6xl p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
