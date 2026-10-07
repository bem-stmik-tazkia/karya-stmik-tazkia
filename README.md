# 🎓 Karya Tazkia — Galeri Portofolio Mahasiswa STMIK Tazkia

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-[ISI]-lightgrey)

**Karya Tazkia** adalah galeri digital tempat mahasiswa STMIK Tazkia memamerkan karya (web, aplikasi mobile, riset, IoT, dan desain/multimedia) sekaligus membangun profil portofolio. Karya yang dikirim mahasiswa direview otomatis oleh AI dan dapat dimoderasi admin sebelum tayang di galeri publik.

🌐 **Demo:** https://karya.stmik.tazkia.ac.id
🏛️ **Dikelola oleh:** [ISI: nama departemen] BEM STMIK Tazkia — periode [ISI]

---

## ✨ Fitur Utama

- 🖼️ **Galeri & Explore Karya** — filter per kategori, urut berdasarkan like & view
- 👤 **Profil Mahasiswa** — skill, tautan sosial, follow/unfollow, bagikan profil (QR & Open Graph)
- 📤 **Kirim Karya** — upload gambar (dikompres otomatis), tech stack, tim, fitur
- 🤖 **Review AI Otomatis** — cek etika & relevansi karya (OpenRouter / Gemini)
- 📰 **Feed** — posting, like, komentar bertingkat, dengan moderasi AI
- 💬 **Chat Pribadi Terenkripsi (E2EE)** — antar mahasiswa, realtime
- 🔔 **Notifikasi** — status karya (disetujui/ditolak) & bot Telegram untuk admin
- 🛡️ **Admin Panel** — kelola karya, data master, mode maintenance & banner pengumuman
- 🔐 **Login Google** khusus email kampus (`@student.stmik.tazkia.ac.id` / `@stmik.tazkia.ac.id`)

## 🧰 Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling & UI | Tailwind CSS 4, Framer Motion, Lucide, dotLottie |
| Backend & DB | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| AI | OpenRouter (model gratis) dengan fallback Google Gemini |
| Rate limiting | Upstash Redis |
| Enkripsi chat | TweetNaCl |
| Hosting | [ISI: konfirmasi — mis. Vercel] |

> Versi lengkap tiap library ada di [`package.json`](./package.json) dan di Dokumen Panduan bab 5.

## 📸 Screenshot

| Beranda | Explore | Profil Mahasiswa | Admin Panel |
|---|---|---|---|
| ![Beranda](docs/screenshots/home.png) | ![Explore](docs/screenshots/explore.png) | ![Profil](docs/screenshots/student.png) | ![Admin](docs/screenshots/admin.png) |

> [ISI: tambahkan file screenshot ke folder `docs/screenshots/`]

## ✅ Prasyarat

- Node.js [ISI: versi minimum, mis. 20 LTS] & npm
- Akses ke project Supabase (URL + anon key) — minta ke PIC
- (Opsional) API key OpenRouter/Gemini, Upstash Redis, bot Telegram

## 🚀 Instalasi & Quick Start

```bash
# 1. Clone repository
git clone git@github.com:bem-stmik-tazkia/karya-stmik-tazkia.git
cd karya-stmik-tazkia

# 2. Install dependency
npm install

# 3. Siapkan environment variable
cp .env.example .env.local
# lalu isi nilai-nilainya (lihat contoh di bawah)

# 4. Jalankan mode development
npm run dev
# buka http://localhost:3000
```

Perintah lain: `npm run build` (build produksi), `npm run start` (jalankan hasil build), `npm run lint` (cek kode).

## 🔑 Contoh `.env.example`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Review & Moderasi
CRON_SECRET=
OPENROUTER_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=

# Maintenance bypass
MAINTENANCE_BYPASS_SECRET=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Telegram (opsional, bisa juga diatur dari Admin > Data Master)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

> ⚠️ Jangan pernah commit file `.env.local`. Penjelasan tiap variabel ada di Dokumen Panduan bab 6.

## 📁 Struktur Folder Singkat

```
├── public/            # Aset statis & animasi .lottie
├── scripts/           # Script utilitas (seed/cleanup data dummy, import repo GitHub)
├── sql/               # Skema & migrasi database Supabase
│   └── migrations/
└── src/
    ├── app/           # Halaman & API routes (Next.js App Router)
    │   ├── admin/     # Admin panel
    │   └── api/       # ai-review, moderate-post, maintenance, notify, og, dll.
    ├── components/    # Komponen UI (admin, feed, mahasiswa, layout, ui, …)
    ├── hooks/         # Custom React hooks
    ├── lib/           # Klien Supabase, layanan data, Telegram
    ├── types/         # Tipe TypeScript (karya, profil)
    ├── utils/         # Helper (rate limit, kripto, opsi prodi/skill)
    └── proxy.ts       # Middleware maintenance mode
```

## 🤝 Kontribusi

1. Buat branch dari `main`: `git checkout -b feat/nama-fitur`
2. Commit dengan format [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:` …)
3. Pastikan `npm run lint` dan `npm run build` lolos
4. Buka Pull Request ke `main` dan minta review PIC

Alur staging, pengujian, dan perubahan database dijelaskan di Dokumen Panduan bab 7.

## 📄 Lisensi

[ISI: jenis lisensi, mis. MIT / hak cipta BEM STMIK Tazkia — belum ada file LICENSE]

## 📞 Kontak

- **PIC:** [ISI: nama] — [ISI: email] — WA [ISI]
- **Organisasi:** BEM STMIK Tazkia — https://bem.stmik.tazkia.ac.id

## 📚 Dokumentasi Lengkap

Panduan serah terima lengkap — arsitektur, skema database, keamanan (RLS), SOP admin & konten, branding, backup, transfer akun/domain, troubleshooting, dan checklist awal periode — tersedia di:

👉 **Dokumen Panduan & Serah Terima Karya Tazkia** — [`docs/PANDUAN_SERAH_TERIMA.md`](docs/PANDUAN_SERAH_TERIMA.md) · versi Word/PDF: [ISI: link Google Drive]
