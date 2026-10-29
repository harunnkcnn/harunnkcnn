/** Küçük, güvenli markdown çevirici: ##, ###, listeler, **kalın**, `kod`, [link](url). HTML kaçışlanır. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s: string) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2" rel="noopener">$1</a>');
}

export function renderMd(src: string): string {
  const out: string[] = [];
  let list = false;
  const close = () => { if (list) { out.push("</ul>"); list = false; } };
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.*)/))) { close(); out.push(`<h3>${inline(m[1])}</h3>`); }
    else if ((m = line.match(/^##\s+(.*)/))) { close(); out.push(`<h2>${inline(m[1])}</h2>`); }
    else if ((m = line.match(/^[-*]\s+(.*)/))) { if (!list) { out.push("<ul>"); list = true; } out.push(`<li>${inline(m[1])}</li>`); }
    else if (!line.trim()) close();
    else { close(); out.push(`<p>${inline(line)}</p>`); }
  }
  close();
  return out.join("\n");
}
