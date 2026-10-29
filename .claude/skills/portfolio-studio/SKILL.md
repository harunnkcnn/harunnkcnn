---
name: portfolio-studio
description: Harun'un AI destekli portföy/ajans sitesini (studio/) geliştirirken kullan — sıkıcı olmayan tasarım kuralları, mimari, admin panelde Claude (SEO/metin) ve OpenAI (görsel) entegrasyonu ekleme, SEO kontrol listesi ve test akışı. "yeni sayfa", "yeni AI özelliği", "yeni koleksiyon", "tasarım ekle", "SEO iyileştir" gibi isteklerde tetikle.
---

# Portfolio Studio

`studio/` altındaki Next.js 15 (App Router) + TypeScript + Tailwind v4 + `motion` projesi. İki dilli (tr/en), dosya tabanlı veri (`data/*.json`), AI destekli admin paneli.

## 0. Önce oku
1. `studio/README.md` — çalıştırma, ortam değişkenleri.
2. `src/lib/types.ts` — veri modeli. `L = {tr, en}` her görünür metnin biçimidir.
3. İşe başlamadan `npm run typecheck && npm test`; bitirince `npm run build && npm run e2e`.

## 1. Tasarım kuralları (sıkıcı AI sitesi YASAK)
- **Kimlik:** mürekkep siyahı `ink`, asit-limon `acid` (ana vurgu), kor-turuncu `ember` (ikincil), kâğıt beyazı `paper`. Renkler `globals.css` `@theme` içinde; sabit hex yazma.
- **Tipografi:** başlık `font-display` (Bricolage Grotesque) çok büyük ve sıkı (`tracking-tight`, `leading-[0.9]`); etiket/meta `font-mono` uppercase `tracking-widest`; gövde Inter.
- **İmza hareket:** yazılım/tasarım ayrık hero (imleçle kayar). Yeni bölümlerde de "iki disiplin" fikrini taşı; tek tip kart ızgarası yapma.
- **Hareket bütçesi:** bir görünümde en fazla 1 baskın animasyon. Giriş = `Reveal`/`SplitWords`; sayfa geçişi = `PageTransition`; mikro = hover. Her şeyi animasyonlama. `prefers-reduced-motion` mutlaka çalışmalı (bileşenler `useReducedMotion` kullanır).
- **Yerleşim:** bento/asimetrik ızgara, büyük boşluk, ince `border-line` çizgileri. Mobilde tek sütun; yatay taşma olmamalı (Playwright ile `scrollWidth - innerWidth === 0` kontrol et).
- **Yasaklar:** mor-mavi gradient arka planlar, stok "hero + 3 kart" şablonu, emoji süsleme, jenerik "Hizmetlerimiz" kartları, lorem ipsum, uydurma müşteri/sayı/referans.
- Erişilebilirlik: tek `h1`, odak halkası görünür, `aria-hidden` yalnızca dekoratif öğelerde, kontrast AA.

## 2. Mimari haritası
| Yer | Görev |
|---|---|
| `src/lib/db.ts` | Atomik JSON okuma/yazma (`DATA_DIR`) |
| `src/lib/content.ts` | Koleksiyon CRUD, tohumlama (`seed.ts`), slug benzersizliği |
| `src/lib/auth.ts` | HMAC imzalı oturum çerezi, `guard()` (oturum + origin kontrolü), giriş hız sınırı |
| `src/lib/ai.ts` | `claudeText/claudeJson`, `openaiImage`, anahtar/ayar yönetimi, çağrı günlüğü |
| `src/lib/aifill.ts` | "AI ile doldur": Claude'dan JSON → zod → yalnız boş alanları birleştir |
| `src/lib/seo.ts` | Anında çalışan yerel SEO skoru (AI gerektirmez) |
| `src/app/(site)/[lang]` | Genel site (SSG + `revalidatePath` ile yenilenir) |
| `src/app/admin/(panel)` | Yönetim paneli (her sayfa `isAdmin()` ile korunur) |
| `src/app/api/admin/*` | Yönetim API'leri — **her handler `guard(method)` ile başlar** |

Kural: AI anahtarı asla istemciye dönmez; GET yalnızca maske (`sk-ant…abcd`) verir.

## 3. Yeni AI özelliği ekleme tarifi
1. `lib/` içinde saf fonksiyon yaz; modeli `claudeJson(action, system, user)` ile çağır, çıktıyı **zod ile doğrula** (modele güvenme).
2. Sistem istemine: marka kişiliği, iki dil, uzunluk sınırları, "uydurma bilgi yazma" kuralı ekle. JSON anahtarlarını açıkça listele.
3. `api/admin/ai/<ad>/route.ts`: `guard("POST")` → girdi doğrula → `AiError` durum kodlarını (400 anahtar yok, 502 sağlayıcı hatası) HTTP'ye çevir.
4. UI: `Btn variant="ai"` (ember çerçeve) + yükleniyor durumu + `Toast`. AI sonucu **kaydetmeden forma uygulanır**; insan onayı şart.
5. Çağrı otomatik `data/ailog.json`'a yazılır (AI & API sayfasında görünür) — `timed()` içinden geçtiğinden emin ol.
6. `scripts/e2e.ts` içindeki sahte sunucuya yeni uç noktanın yanıtını ve bir test adımı ekle.

## 4. Yeni koleksiyon ekleme
`types.ts` (tip + `Collection`) → `seed.ts` → `content.ts` (`seeds` haritası) → `blank.ts` → `api/admin/entity/[collection]/route.ts` (zod şeması) → `aifill.ts` (`FIELDS`) → `Sidebar` öğesi → genel sayfa + `sitemap.ts`.

## 5. SEO kontrol listesi (her yeni genel sayfa)
- `generateMetadata`: title, description, `alternates.canonical` + `languages` (tr/en/x-default), OG görseli.
- JSON-LD (`JsonLd` bileşeni): kişi/CreativeWork/BlogPosting; `<` kaçışlıdır.
- `sitemap.ts`'e ekle; `robots.ts` `/admin` ve `/api/admin` kapalı kalsın.
- Görseller `alt` metinli; `next/image` `sizes` verilmiş; tek `h1`.
- Başlık 30–60, açıklama 110–160 karakter, ana anahtar kelime başlıkta ve açıklamada (panelin yerel skoru bunu ölçer).
- `SITE_URL` **derleme anında** gömülür; canlıya almadan önce ayarla ve yeniden derle.

## 6. Doğrulama
- `npm run typecheck`, `npm test` (birim), `npm run build`, `npm run e2e` (sahte Claude/OpenAI sunucusuyla gerçek `next start`; kimlik, CSRF, AI doldurma, görsel üretimi, SEO, silme akışı).
- Görsel değişiklikte Playwright ile 1440×900 ve 390×844 ekran görüntüsü al, gözle kontrol et; konsol hatası ve yatay taşma sıfır olmalı.
- Gerçek API anahtarı yoksa AI özelliklerini yalnızca sahte sunucuyla doğruladığını açıkça söyle — gerçek model çıktısı test edilmedi demektir.
