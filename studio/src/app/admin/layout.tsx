import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/jetbrains-mono";
import "../globals.css";

export const metadata: Metadata = { title: "Yönetim Paneli", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
