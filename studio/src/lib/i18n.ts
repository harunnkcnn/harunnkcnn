import type { Lang } from "./types";

const dict = {
  tr: {
    navWork: "İşler", navServices: "Hizmetler", navBlog: "Yazılar", navContact: "İletişim",
    code: "Yazılım", design: "Tasarım", all: "Tümü",
    heroCta: "Projeni anlat", heroCta2: "İşleri gör",
    hint: "İmleci sağa sola oynat",
    servicesTitle: "Hizmetler", servicesSub: "İki disiplin, tek ekip: işini büyüten yazılım ve onu anlatan tasarım.",
    workTitle: "Seçili işler", workSub: "Yazılım ve tasarımdan örnekler.", viewCase: "Vaka çalışmasını gör",
    processTitle: "Nasıl çalışırım", 
    steps: [
      ["Dinle", "İşini, müşterini ve hedefini netleştiririz. Ölçülecek tek bir başarı kriteri seçeriz."],
      ["Tasarla", "Kimliği ve arayüzü birlikte kurarız; sıkıcı şablon yok, işine özel sistem var."],
      ["Geliştir", "Yapay zekâ destekli hızlı üretim, insan kontrolünde. Ara teslimlerle ilerleriz."],
      ["Yayınla & ölç", "SEO, hız ve analitik hazır yayına alırız; sonuçlara göre iyileştiririz."],
    ],
    blogTitle: "Yazılar", blogAll: "Tüm yazılar", readMore: "Oku", back: "Geri",
    aboutTitle: "Hakkımda",
    contactTitle: "Birlikte yapalım", contactSub: "Kısaca anlat, 24 saat içinde dönüş yapayım.",
    fName: "Adın", fEmail: "E-posta", fBudget: "Bütçe aralığı", fText: "Projen",
    send: "Gönder", sending: "Gönderiliyor…", sent: "Mesajın ulaştı. Teşekkürler!", failed: "Gönderilemedi, lütfen tekrar dene.",
    sectors: ["Esnaf", "Fabrika", "Market", "Lojistik", "Ajans", "E-ticaret", "Sağlık", "Eğitim", "Restoran", "İnşaat", "Turizm", "Kuaför"],
    tagline: "Yazılım × Tasarım",
    empty: "Henüz içerik yok.", year: "Yıl", tags: "Etiketler", visit: "Siteyi ziyaret et",
    skip: "İçeriğe geç",
  },
  en: {
    navWork: "Work", navServices: "Services", navBlog: "Journal", navContact: "Contact",
    code: "Code", design: "Design",  all: "All",
    heroCta: "Tell me about your project", heroCta2: "See the work",
    hint: "Move your pointer left and right",
    servicesTitle: "Services", servicesSub: "Two disciplines, one team: software that grows your business and design that tells its story.",
    workTitle: "Selected work", workSub: "Samples from software and design.", viewCase: "View case study",
    processTitle: "How I work",
    steps: [
      ["Listen", "We pin down your business, your customer and your goal, then pick one success metric."],
      ["Design", "We build identity and interface together — no boring templates, a system made for you."],
      ["Build", "AI-assisted rapid production under human control, delivered in small increments."],
      ["Ship & measure", "Launched with SEO, speed and analytics in place, then improved with real data."],
    ],
    blogTitle: "Journal", blogAll: "All posts", readMore: "Read", back: "Back",
    aboutTitle: "About",
    contactTitle: "Let's build it", contactSub: "Tell me briefly — I'll reply within 24 hours.",
    fName: "Your name", fEmail: "Email", fBudget: "Budget range", fText: "Your project",
    send: "Send", sending: "Sending…", sent: "Message received. Thank you!", failed: "Could not send, please try again.",
    sectors: ["Local shops", "Factories", "Retail", "Logistics", "Agencies", "E-commerce", "Health", "Education", "Restaurants", "Construction", "Tourism", "Salons"],
    tagline: "Code × Design",
    empty: "Nothing here yet.", year: "Year", tags: "Tags", visit: "Visit site",
    skip: "Skip to content",
  },
} as const;

export const dt = (lang: Lang) => dict[lang];
