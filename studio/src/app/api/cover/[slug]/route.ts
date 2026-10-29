/** Görseli olmayan kayıtlar için slug'dan türetilen, her seferinde aynı çıkan üretken kapak (SVG). */
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let h = hash(slug);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000;
  const palettes = [["#d4ff3a", "#ff5b2e"], ["#ff5b2e", "#7c5cff"], ["#3affd0", "#d4ff3a"], ["#ff3a8c", "#ffd23a"], ["#7c5cff", "#3affd0"]];
  const [a, b] = palettes[hash(slug) % palettes.length];
  const shapes = Array.from({ length: 7 }, (_, i) => {
    const x = Math.round(rnd() * 1200), y = Math.round(rnd() * 800), r = Math.round(80 + rnd() * 260);
    const fill = i % 2 ? a : b;
    return i % 3 === 0
      ? `<rect x="${x - r / 2}" y="${y - r / 2}" width="${r}" height="${r}" fill="${fill}" opacity="${0.25 + rnd() * 0.5}" transform="rotate(${Math.round(rnd() * 90)} ${x} ${y})"/>`
      : `<circle cx="${x}" cy="${y}" r="${r / 2}" fill="${i % 3 === 1 ? "none" : fill}" stroke="${fill}" stroke-width="${i % 3 === 1 ? 3 : 0}" opacity="${0.3 + rnd() * 0.6}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-hidden="true"><defs><filter id="n"><feTurbulence baseFrequency=".8" numOctaves="2"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .08 0"/></filter></defs><rect width="1200" height="800" fill="#0d0d0f"/>${shapes}<rect width="1200" height="800" filter="url(#n)"/></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=31536000, immutable" } });
}
