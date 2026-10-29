import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/content";

export async function GET(req: Request) {
  const title = (new URL(req.url).searchParams.get("title") || "").slice(0, 90);
  const s = await getSettings();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0b0b0d", color: "#f1eee6" }}>
        <div style={{ display: "flex", color: "#d4ff3a", fontSize: 28, letterSpacing: 6 }}>{s.name.toUpperCase()}</div>
        <div style={{ display: "flex", fontSize: title ? 84 : 128, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>{title || "Code × Design"}</div>
        <div style={{ display: "flex", height: 12, width: 220, background: "#ff5b2e" }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
