import type { Post, Project, Service, SiteSettings, Seo, L } from "./types";

const now = new Date().toISOString();
const l = (tr: string, en: string): L => ({ tr, en });
const seo = (t: L, d: L, k: string[], a: L): Seo => ({ title: t, description: d, keywords: k, altText: a });

export const seedSettings: SiteSettings = {
  name: "Harun Kaçan",
  role: l("Yazılım Geliştirici & Grafik Tasarımcı", "Software Developer & Graphic Designer"),
  heroLine: l(
    "Her sektör için yazılım ve tasarım. Hızlı, ölçülebilir, akılda kalan.",
    "Software and design for every industry. Fast, measurable, memorable.",
  ),
  about: l(
    "İşletmelerin günlük işini kolaylaştıran yazılımlar ve markaları öne çıkaran tasarımlar üretiyorum. Esnaftan fabrikaya her sektörden firmaya web sitesi, otomasyon ve özel yazılım geliştiriyor; logo, sosyal medya ve reklam tasarımı yapıyorum. Yapay zekâyı geliştirme sürecimin merkezine koyarak hızlı ve kaliteli iş teslim ediyorum.",
    "I build software that makes everyday business easier and designs that make brands stand out. From local shops to factories, I develop websites, automation and custom software for every sector, and create logos, social media and advertising designs. AI sits at the core of my workflow, so I ship fast without cutting corners.",
  ),
  email: "",
  linkedin: "https://www.linkedin.com/in/harun-ka%C3%A7an-58b423335/",
  behance: "https://www.behance.net/harunkaan1",
  github: "https://github.com/harunnkcnn",
  seo: seo(
    l("Harun Kaçan — Yazılım & Tasarım Stüdyosu", "Harun Kaçan — Software & Design Studio"),
    l(
      "Her sektör için web sitesi, otomasyon, özel yazılım, logo ve marka tasarımı. Yapay zekâ destekli hızlı teslimat.",
      "Websites, automation, custom software, logo and brand design for every industry. AI-assisted fast delivery.",
    ),
    ["web sitesi", "özel yazılım", "grafik tasarım", "logo tasarımı", "otomasyon", "software developer"],
    l("Harun Kaçan portföy sitesi", "Harun Kaçan portfolio website"),
  ),
};

const svc = (
  slug: string, kind: "software" | "design", icon: string, order: number, tr: [string, string], en: [string, string],
): Service => ({
  id: slug, slug, kind, icon, order, published: true, createdAt: now, updatedAt: now,
  title: l(tr[0], en[0]), summary: l(tr[1], en[1]),
});

export const seedServices: Service[] = [
  svc("web", "software", "⌘", 1, ["Kurumsal & portföy web siteleri", "SEO uyumlu, hızlı, yönetilebilir siteler."], ["Business & portfolio websites", "SEO-ready, fast, easy to manage."]),
  svc("eticaret", "software", "◈", 2, ["E-ticaret siteleri", "Ürün, ödeme ve sipariş akışı tek çatıda."], ["E-commerce stores", "Catalog, payments and orders in one place."]),
  svc("otomasyon", "software", "↻", 3, ["İş akışı otomasyonu", "Tekrarlayan işleri otomatiğe bağlayan sistemler."], ["Workflow automation", "Systems that automate repetitive work."]),
  svc("ozel-yazilim", "software", "▤", 4, ["Muhasebe, depo & sevkiyat yazılımları", "Fabrika, market ve terminal çözümleri."], ["Accounting, warehouse & shipping software", "Factory, retail and POS solutions."]),
  svc("randevu", "software", "◷", 5, ["Randevu & rezervasyon sistemleri", "Esnaf için kolay, mobil uyumlu sistemler."], ["Booking systems", "Simple, mobile-first booking for local businesses."]),
  svc("logo", "design", "✦", 6, ["Logo & kurumsal kimlik", "Akılda kalan marka sistemleri."], ["Logo & brand identity", "Memorable brand systems."]),
  svc("sosyal", "design", "◐", 7, ["Sosyal medya tasarımı", "Tutarlı, dikkat çeken içerik setleri."], ["Social media design", "Consistent, scroll-stopping content sets."]),
  svc("reklam", "design", "▲", 8, ["Billboard & reklam görselleri", "Büyük formatta net mesaj."], ["Billboard & ad visuals", "Clear message at large scale."]),
  svc("ui", "design", "▦", 9, ["Landing page & UI mockup", "Dönüşüm odaklı arayüz tasarımları."], ["Landing page & UI mockups", "Conversion-focused interface design."]),
];

const proj = (
  slug: string, kind: "software" | "design", year: string, tags: string[], tr: [string, string, string], en: [string, string, string], featured = true,
): Project => ({
  id: slug, slug, kind, year, tags, featured, published: true, client: "", url: "", cover: "",
  title: l(tr[0], en[0]), summary: l(tr[1], en[1]), body: l(tr[2], en[2]),
  seo: seo(l(`${tr[0]} — Vaka çalışması`, `${en[0]} — Case study`), l(tr[1], en[1]), tags, l(tr[0], en[0])),
  createdAt: now, updatedAt: now,
});

// Örnek içerik: yönetim panelinden silin ya da kendi işlerinizle değiştirin.
export const seedProjects: Project[] = [
  proj("sevkiyat-depo-paneli", "software", "2026", ["Next.js", "TypeScript", "Dashboard"],
    ["Sevkiyat & Depo Paneli", "Sevkiyat ve stok takibi için yönetim paneli.", "## Sorun\nSevkiyat ve stok bilgisi dağınık tablolarda tutuluyordu.\n\n## Çözüm\nTek ekranda stok, sevkiyat ve rapor akışı.\n\n- Anlık stok görünümü\n- Sevkiyat durum takibi\n- Dışa aktarılabilir raporlar"],
    ["Shipping & Warehouse Panel", "Management panel for shipping and stock tracking.", "## Problem\nShipping and stock data lived in scattered spreadsheets.\n\n## Solution\nStock, shipments and reports in one screen.\n\n- Live stock view\n- Shipment status tracking\n- Exportable reports"]),
  proj("sosyal-medya-ajans-paneli", "software", "2026", ["Next.js", "Takvim", "Onay akışı"],
    ["Sosyal Medya Ajans Paneli", "Çok müşterili içerik takvimi, onay ve raporlama.", "## Amaç\nAjansların müşteri içeriklerini tek yerden yönetmesi.\n\n- İçerik takvimi\n- Müşteri onayı\n- Raporlama"],
    ["Social Media Agency Panel", "Multi-client content calendar, approvals and reporting.", "## Goal\nLet agencies manage every client's content in one place.\n\n- Content calendar\n- Client approvals\n- Reporting"]),
  proj("ai-is-asistani", "software", "2026", ["AI", "n8n", "Claude"],
    ["AI İş Asistanı", "İşletmeler için otomasyon ve yapay zekâ ajanları.", "## Fikir\nTekrarlayan işleri yapay zekâ ajanlarına devretmek.\n\n- Mesaj sınıflandırma\n- Otomatik taslak yanıt\n- Rapor üretimi"],
    ["AI Business Assistant", "Automation and AI agents for businesses.", "## Idea\nHand repetitive work to AI agents.\n\n- Message triage\n- Draft replies\n- Report generation"]),
  proj("marka-kimligi-seti", "design", "2026", ["Logo", "Kurumsal kimlik"],
    ["Marka Kimliği Seti", "Logo, renk ve tipografi sistemiyle bütünlüklü kimlik.", "## Kapsam\nLogo, renk paleti, tipografi ve uygulama örnekleri."],
    ["Brand Identity Set", "A cohesive identity with logo, colour and type system.", "## Scope\nLogo, colour palette, typography and applications."], false),
  proj("sosyal-medya-seti", "design", "2026", ["Sosyal medya", "Şablon"],
    ["Sosyal Medya Tasarım Seti", "Tutarlı gönderi ve hikâye şablonları.", "## Kapsam\nGönderi, hikâye ve kapak şablonları."],
    ["Social Media Design Set", "Consistent post and story templates.", "## Scope\nPost, story and cover templates."], false),
  proj("billboard-kampanyasi", "design", "2026", ["Billboard", "Reklam"],
    ["Billboard Kampanyası", "Büyük formatta tek mesaj, güçlü kompozisyon.", "## Kapsam\nBillboard ve açık hava reklam görselleri."],
    ["Billboard Campaign", "One message, strong composition at large scale.", "## Scope\nBillboard and outdoor ad visuals."], false),
];

export const seedPosts: Post[] = [
  {
    id: "yapay-zeka-ile-web-sitesi", slug: "yapay-zeka-ile-web-sitesi", published: true,
    title: l("Yapay zekâ ile web sitesi yapmak: hızlı ama sıkıcı olmayan yol", "Building a website with AI: fast, but never boring"),
    excerpt: l("AI araçlarıyla hız kazanırken tasarımın kişiliğini nasıl korursunuz?", "How to gain speed with AI tools while keeping a design's personality."),
    body: l(
      "## Hız ile kişilik\nAI hız kazandırır; kişiliği ise sizin kararlarınız verir.\n\n## Üç kural\n- Şablon değil, sistem kurun\n- Hareketi az ama anlamlı kullanın\n- Her sayfa için SEO başlığını ve açıklamasını yazın",
      "## Speed and personality\nAI buys speed; personality comes from your decisions.\n\n## Three rules\n- Build a system, not a template\n- Use motion sparingly but meaningfully\n- Write the SEO title and description for every page",
    ),
    cover: "", tags: ["AI", "Web", "SEO"],
    seo: seo(l("Yapay zekâ ile web sitesi yapmak", "Building a website with AI"), l("AI ile hızlı ama kişilikli web sitesi yapmanın üç kuralı.", "Three rules for building fast, characterful websites with AI."), ["yapay zeka", "web sitesi", "seo"], l("Yapay zekâ ile web tasarımı", "Web design with AI")),
    createdAt: now, updatedAt: now,
  },
];
