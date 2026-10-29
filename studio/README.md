# Studio — Harun Kaçan portföy & ajans sitesi

Next.js 15 · TypeScript · Tailwind v4 · motion · iki dilli (TR/EN) · AI destekli yönetim paneli.

## Hızlı başlangıç

```bash
cd studio
cp .env.example .env      # ADMIN_PASSWORD'ü değiştir
npm install
npm run dev               # http://localhost:3000  → /tr
```

Yönetim paneli: **http://localhost:3000/admin** (şifre: `.env` içindeki `ADMIN_PASSWORD`).

Üretim: `SITE_URL=https://alanadin.com npm run build && npm start`
(`SITE_URL` canonical/sitemap/OG için **derleme anında** kullanılır.)

## AI özellikleri (Admin → AI & API'den anahtar gir)

| Özellik | Sağlayıcı | Nerede |
|---|---|---|
| **AI ile doldur** — başlık, özet, içerik, etiket, slug, SEO başlığı/açıklaması/anahtar kelime, alt metin, TR↔EN | Claude | Proje/yazı/hizmet düzenleyici |
| **Claude SEO analizi** — skor yorumu, kritik sorunlar, yeniden yazım önerisi, içerik fikirleri, schema önerisi | Claude | Düzenleyici + SEO Lab |
| **Görsel üret** (kapak) + "Claude prompt yazsın" | OpenAI (`gpt-image-1`) | Düzenleyicide "Görsel" kartı |
| **Anında SEO skoru** (AI'sız, ücretsiz) | yerel | Düzenleyici, SEO Lab, Genel bakış |
| API yönetimi: anahtar, model, boyut, base URL, bağlantı testi, çağrı günlüğü | — | AI & API |

Modelleri panelden değiştirebilirsin (Claude için hesabındaki herhangi bir model kimliği).
Anahtarlar sunucuda `data/ai.json`'da tutulur (git'e girmez), tarayıcıya geri gönderilmez.
`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` ortam değişkenleri panel ayarının önüne geçer.

## Yapı

- `src/app/(site)/[lang]` — genel site (anasayfa, `/work/[slug]`, `/blog`, `/blog/[slug]`)
- `src/app/admin` — yönetim paneli
- `src/app/api` — iletişim formu, admin API'leri, OG görseli, üretken kapaklar, `/media`
- `data/` — içerik (JSON) ve yüklemeler; ilk açılışta örnek içerikle tohumlanır
- `.claude/skills/portfolio-studio` (depo kökünde) — bu projeyi geliştirirken kullanılan skill

## Test

```bash
npm run typecheck
npm test              # birim testleri
npm run build && npm run e2e   # sahte Claude/OpenAI ile uçtan uca
```

## Güvenlik notları

- Oturum: HMAC imzalı, HttpOnly, SameSite=Lax çerez; giriş denemesi sınırlı; yazma isteklerinde origin kontrolü.
- Markdown çıktısı HTML-kaçışlıdır; yalnız `http(s)` ve `/` bağlantılarına izin verilir.
- Tek yönetici modeli için tasarlandı. Çok kullanıcı/rol gerekiyorsa gerçek bir veritabanı + auth sağlayıcısı ekle.
- Dosya tabanlı veri tek sunucu içindir; sunucusuz/çok kopyalı ortamlarda (Vercel vb.) kalıcı disk yoktur — VPS/Docker ya da veritabanı katmanı kullan.
