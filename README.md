# Sewaka — Wedding Planner untuk Adat Nusantara

Platform perencanaan pernikahan digital yang dirancang khusus untuk pernikahan
adat Indonesia. Sewaka membantu pasangan mengelola semua aspek pernikahan —
dari checklist, anggaran, vendor, tamu, hingga tradisi adat yang khas seperti
seserahan, rundown adat, dan ensiklopedia budaya.

## ✨ Fitur Utama

### 🏠 Workspace & Dashboard
- **Wedding Workspace** — ruang kolaborasi untuk pasangan dan keluarga
- **Onboarding Wizard** — panduan setup 5 langkah untuk workspace baru
- **Dashboard Lengkap** — countdown pernikahan, quick actions, overview budget, tasks, events, guests, vendors
- **Wedding Countdown** — timer live menuju hari H
- **Wedding Concept** — tema, palet warna, dan deskripsi konsep pernikahan

### ✅ Tasks & Checklist
- **Task Management** — CRUD tasks dengan kategori, status, prioritas
- **Checklist Templates** — template tasks dengan offset days
- **Task Notes & Attachments** — catatan dan file lampiran per task
- **Recurring Tasks** — tasks berulang (harian, mingguan, bulanan)
- **Task Assignment** — assign tasks ke anggota workspace
- **Comments System** — diskusi dan reply di setiap task

### 💰 Budget & Finance
- **Budget Planning** — total anggaran dan alokasi per kategori
- **Expense Tracking** — catat pengeluaran dengan attachment
- **Financial Reports** — laporan keuangan lengkap dengan perbandingan estimasi vs realisasi
- **Budget Export** — export laporan ke CSV
- **Budget Comparison Chart** — visualisasi progress per kategori

### 🏪 Vendor Management
- **Vendor Directory** — database vendor pribadi
- **Quotation Management** — create, update, accept, reject quotation
- **Vendor Payments** — tracking DP dan final payment
- **Vendor Comparison** — bandingkan penawaran per kategori
- **Vendor Portfolio** — gallery foto dan detail vendor
- **Contract Management** — upload dan kelola kontrak vendor
- **Curated Vendors** — direktori vendor adat terkurasi
- **Vendor Inquiry** — kirim inquiry ke vendor via Email, Telepon, atau WhatsApp
- **Vendor Review** — rating 1-5 bintang dengan review text
- **Inquiry History** — track status inquiry (SENT, REPLIED, CLOSED)

### 👥 Guest Management
- **Guest Database** — CRUD tamu dengan kategori dan RSVP
- **Guest Import/Export** — import CSV dan export data tamu
- **QR Code Generation** — generate QR code untuk setiap tamu
- **Check-in Scanner** — scan QR code di hari H pernikahan
- **Offline Check-in** — queue check-in saat offline, auto-sync saat online kembali
- **Check-in Audit Log** — track semua check-in (online/offline/sync/conflict)
- **Attendance Report** — laporan kehadiran dan RSVP summary
- **Bulk WhatsApp Invite** — kirim undangan massal via WhatsApp (max 50/batch)
- **WhatsApp RSVP Automation** — tracking message history, template personalisasi, reminder otomatis

### 💌 Digital Invitation (Premium)
- **Cover Page Animation** — halaman "Buka Undangan" full-screen dengan nama tamu personal
- **Love Story Timeline** — timeline visual perjalanan cinta dengan foto dan milestone
- **Hero Photo Carousel** — slider multiple foto couple dengan auto-slide
- **Custom Font & Background** — 5 pilihan Google Fonts dan custom background image
- **Love Animation** — animasi floating hearts saat scroll (toggleable)
- **Event Countdown** — countdown real-time per event, highlight event terdekat
- **Cashless Gift (Kado Digital)** — terima kado digital via bank transfer/e-wallet
- **Video Gallery** — embed YouTube video kenangan
- **Live Streaming** — tautan live streaming untuk tamu yang tidak bisa hadir
- **Share WhatsApp** — bagikan undangan via WhatsApp dengan pesan personal
- **12+ Tema Warna** — emas, burgundy, sage, rose, navy, minimalist, floral, geometric, vintage, tropical, luxury, pastel
- **Custom Email Invite** — kirim undangan via email dengan HTML template personal
- **Guest Photo Upload** — tamu bisa upload foto di undangan dengan moderation admin
- **Musik Latar** — audio player dengan auto-play setelah buka undangan
- **RSVP & Ucapan** — tamu bisa konfirmasi kehadiran dan kirim doa restu
- **QR Check-in** — tamu VIP dengan badge eksklusif dan QR code check-in
- **Tradisi Adat** — section budaya Nusantara (keunggulan unik Sewaka!)
- **Performance Optimized** ⚡ — bundle splitting, lazy loading, image optimization, caching
- **SEO Ready** — Open Graph dynamic images, Twitter Cards, JSON-LD structured data

### ⚡ Performance & SEO
- **Bundle Optimization** — dynamic import qrcode library (~30KB reduction)
- **Code Splitting** — lazy load HeroCarousel, StoryTimeline, LoveAnimation
- **Image Optimization** — Next.js Image component dengan auto resize & format
- **Caching Strategy** — 1 hour revalidate untuk invitation pages, immutable static assets
- **Open Graph Images** — dynamic OG image generation per undangan
- **Twitter Cards** — summary_large_image untuk social sharing
- **JSON-LD Structured Data** — WeddingEvent schema untuk SEO
- **Canonical URLs** — alternates canonical untuk setiap invitation page

### 📄 Documents & Gallery
- **Document Upload** — upload dan kelola file dokumen (50MB max)
- **Image Gallery** — gallery foto referensi pernikahan
- **File Preview** — preview image, PDF, video, audio langsung di browser
- **Document Sharing** — share dokumen via link dengan expiry

### 🎭 Cultural Features (Khas Sewaka!)
- **Cultural Workflow Generator** ⭐ — auto-generate rundown, seserahan, checklist dari pilih tradisi (USP!)
- **Task Source Tracking** — track asal tugas: MANUAL, CULTURAL_WORKFLOW, ENCYCLOPEDIA
- **Encyclopedia CTA** — banner di Ensiklopedia Adat mengarah ke Workflow Generator
- **Onboarding CTA** — button di onboarding wizard untuk langsung generate workflow
- **Seserahan Tracker** — kelola seserahan dan mahar adat
- **Cultural Rundown** — rundown acara pernikahan adat
- **Wedding Day Rundown** — timeline visual hari H
- **Cultural Encyclopedia** — ensiklopedia tradisi adat Nusantara
- **Timeline View** — view timeline semua acara dan rundown

### 🪑 Seating Planner
- **Table Management** — CRUD meja dengan kapasitas dan posisi
- **Seat Assignment** — assign tamu ke meja dengan seat number
- **Capacity Tracking** — monitor occupied vs available seats
- **Visual Layout** — table cards dengan posisi X/Y

### 🚨 Wedding Day Command Center
- **Team Management** — CRUD kru dan vendor dengan role, phone, status
- **Incident Tracking** — laporkan dan track insiden dengan severity level

### 📊 Dashboard Analytics
- **RSVP Chart** — Progress bar dengan persentase Hadir, Tidak Hadir, Pending
- **Budget Chart** — Progress bar per kategori dengan warna hijau/kuning/merah
- **Attendance Chart** — Bar chart check-in tamu 7 hari terakhir
- **Vendor Table** — Rekomendasi vendor kurasi dengan rating

### 📋 Check-in Audit Logs
- **Audit Log Table** — Monitor semua aktivitas check-in dengan filter
- **Stats Cards** — Total logs, synced, pending, failed
- **Export CSV** — Download audit logs ke file CSV

### 💌 WhatsApp Reminder Cron
- **Auto Reminder** — Kirim reminder WhatsApp 7 hari dan 1 hari sebelum wedding
- **Cron Job** — Berjalan setiap jam via Vercel Cron

### 📋 Berkas Nikah KUA/Catatan Sipil
- **Checklist Adaptif** — Template checklist berdasarkan jenis nikah (SIPIL, AGAMA, KUA)
- **Progress Tracking** — Progress bar dan status per dokumen
- **File Upload** — Upload berkas per dokumen dengan deadline tracking

### 💝 Guest Thank You Automation
- **Template Pesan** — Template dengan placeholder {guestName} dan {coupleName}
- **Batch Generate** — Generate pesan untuk semua tamu sekaligus
- **WhatsApp Link** — Tombol "Buka WA" per tamu untuk kirim pesan langsung
- **Status Tracking** — Monitor status (PENDING, SENT, FAILED) per pesan

### 💳 Subscription & Payment
- **Subscription Plans** — Free, Basic, Premium dengan fitur berbeda
- **Midtrans Integration** — payment gateway untuk Indonesia
- **Subscription History** — track pembayaran dan status langganan

### 🏪 Vendor Marketplace
- **Curated Directory** — direktori vendor adat terkurasi dengan filter
- **Inquiry System** — kirim inquiry ke vendor via Email, Telepon, atau WhatsApp
- **Review & Rating** — rating 1-5 bintang dengan review text
- **Inquiry History** — track status inquiry (SENT, REPLIED, CLOSED)

### 🎯 Final Integration
- **Vendor Inquiry Integration** — tombol "Kirim Inquiry" dan "Review" di vendor card
- **Guest Thank You WhatsApp** — generate WhatsApp URL scheme per tamu
- **Guest Thank You Email** — support email via Resend API

### 💳 Subscription & Payment
- **Subscription Plans** — Gratis, Premium, Enterprise
- **Payment Integration** — Midtrans Snap untuk checkout
- **Free Trial** — 14 hari trial period
- **Invoice Generation** — generate invoice subscription
- **Subscription History** — riwayat langganan dan pembayaran

### 🔔 Notifications
- **Email Notifications** — task reminder, budget alert, event reminder via Resend
- **Push Notifications** — browser push notification
- **WhatsApp Notifications** — notifikasi via WhatsApp Business API
- **Notification Scheduler** — cron job otomatis setiap jam

### 👨‍💼 Admin Portal
- **Admin Dashboard** — statistik platform
- **User Management** — kelola users dan role admin
- **Workspace Management** — monitor semua workspace
- **Plan Management** — CRUD subscription plans
- **Payment Monitoring** — monitor transaksi pembayaran
- **Support Tickets** — kelola tiket support
- **Content Management** — CMS untuk konten marketing
- **System Logs** — audit log aktivitas

## 🛠 Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16.4.5 (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui (Radix) |
| **Database** | PostgreSQL 17 dengan Row-Level Security |
| **ORM** | Drizzle ORM + Drizzle Kit |
| **Auth** | Auth.js (NextAuth) v5 dengan Google OAuth + Email/Password |
| **Validation** | Zod v4 |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod resolver |
| **Toast** | Sonner |
| **Icons** | Lucide React |
| **QR Code** | qrcode library |
| **Storage** | Vercel Blob (cloud storage) |
| **Email** | Resend API |
| **Payment** | Midtrans Snap |
| **Testing** | Node.js native test runner |
| **Deployment** | Vercel (recommended) |

## 📦 Instalasi

### Prasyarat

- Node.js 20+
- PostgreSQL 17+
- Docker & Docker Compose (untuk development lokal)

### Setup Lokal

```powershell
# Clone repository
git clone <repository-url>
cd com.sewaka-web

# Salin environment variables
Copy-Item .env.example .env

# Edit .env dan isi variabel yang diperlukan:
# - AUTH_SECRET (wajib, minimal 32 karakter)
# - AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET (untuk Google Sign-In)
# - DATABASE_URL (PostgreSQL connection string)
# - RESEND_API_KEY (untuk email)
# - MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY (untuk payment)
# - BLOB_READ_WRITE_TOKEN (untuk file upload)

# Jalankan database
docker compose up -d

# Setup database roles
docker compose exec -T postgres psql -U sewaka -d sewaka -v ON_ERROR_STOP=1 -f /docker-entrypoint-initdb.d/00-rls-owner.sql
docker compose exec -T postgres psql -U sewaka -d sewaka -v ON_ERROR_STOP=1 -f /docker-entrypoint-initdb.d/01-application-role.sql

# Install dependencies
npm install

# Jalankan migrasi database
npm run db:migrate

# Jalankan development server
npm run dev
```

Buka `http://localhost:3000` untuk mengakses aplikasi.

### Environment Variables

| Variabel | Deskripsi | Wajib |
|----------|-----------|-------|
| `AUTH_SECRET` | Secret untuk session encryption | ✅ |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | ✅ |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `MIGRATION_DATABASE_URL` | Connection string untuk migrasi | ✅ |
| `RESEND_API_KEY` | API key Resend untuk email | ⚠️ |
| `MAIL_FROM` | Email pengirim (default: `onboarding@resend.dev`) | ❌ |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key | ⚠️ |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key | ⚠️ |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans Client Key (client-side) | ⚠️ |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token untuk file upload | ⚠️ |
| `WHATSAPP_API_KEY` | WhatsApp Business API key | ❌ |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key untuk push notification | ❌ |
| `CRON_SECRET` | Secret untuk proteksi cron job | ❌ |

⚠️ = Diperlukan untuk fitur tertentu berfungsi penuh

## 📁 Struktur Proyek

```
com.sewaka-web/
├── app/                    # Next.js App Router (routing & pages)
│   ├── (app)/              # Protected routes (auth required)
│   │   ├── dashboard/      # Dashboard utama
│   │   ├── tasks/          # Task management
│   │   ├── budget/         # Budget & finance
│   │   ├── vendors/        # Vendor management
│   │   ├── guests/         # Guest management
│   │   ├── documents/      # Document management
│   │   ├── gallery/        # Image gallery
│   │   ├── contracts/      # Contract management
│   │   ├── seserahan/      # Seserahan tracker
│   │   ├── encyclopedia/   # Cultural encyclopedia
│   │   ├── events/         # Wedding events
│   │   ├── timeline/       # Timeline view
│   │   ├── wedding-day/    # Wedding day rundown
│   │   ├── subscription/   # Subscription & payment
│   │   ├── settings/       # Account settings
│   │   └── workspaces/     # Workspace management
│   ├── admin/              # Admin portal
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── users/          # User management
│   │   ├── workspaces/     # Workspace monitoring
│   │   ├── plans/          # Plan management
│   │   ├── payments/       # Payment monitoring
│   │   ├── logs/           # System logs
│   │   ├── support/        # Support tickets
│   │   └── content/        # Content management
│   ├── api/                # API routes
│   │   ├── auth/           # Auth.js routes
│   │   ├── v1/             # API v1 endpoints
│   │   └── cron/           # Cron job endpoints
│   ├── auth/               # Auth pages (login, register, dll)
│   └── invitation/         # Public invitation pages
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui components
├── db/                     # Database layer
│   ├── schema.ts           # Drizzle schema (28+ tabel)
│   ├── index.ts            # Database connection
│   └── with-workspace.ts   # Workspace RLS helper
├── features/               # Feature modules (domain-driven)
│   ├── auth/               # Authentication
│   ├── dashboard/          # Dashboard
│   ├── workspaces/         # Workspace
│   ├── tasks/              # Tasks
│   ├── budget/             # Budget
│   ├── vendors/            # Vendors
│   ├── guests/             # Guests
│   ├── documents/          # Documents
│   ├── gallery/            # Gallery
│   ├── contracts/          # Contracts
│   ├── seserahan/          # Seserahan
│   ├── encyclopedia/       # Encyclopedia
│   ├── events/             # Events
│   ├── rundown/            # Rundown
│   ├── notifications/      # Notifications
│   ├── subscription/       # Subscription
│   ├── admin/              # Admin
│   └── comments/           # Comments
├── drizzle/                # Database migrations
│   ├── 0000_*.sql          # Initial migration
│   ├── 0001_*.sql          # Auth.js adapter
│   ├── ...                 # Sequential migrations
│   └── 0033_*.sql          # Latest migration
├── lib/                    # Shared utilities
│   ├── email.ts            # Email utility (Resend)
│   ├── email-templates.ts  # Email HTML templates
│   ├── storage.ts          # File storage (Vercel Blob)
│   └── env.ts              # Environment validation
├── docs/                   # Documentation
│   ├── DEPLOYMENT.md       # Production deployment guide
│   ├── specs.md            # Technical specifications
│   ├── architecture.md     # Architecture documentation
│   ├── specification.md    # Feature specifications
│   └── sewaka_brand_guidelines.md
├── tests/                  # Test files
└── public/                 # Static assets
```

## 🗄 Database

### Tabel Utama (28+ tabel)

| Kategori | Tabel |
|----------|-------|
| **Auth** | `users`, `accounts`, `sessions`, `verification_tokens` |
| **Workspace** | `workspaces`, `workspace_members`, `wedding_concepts` |
| **Tasks** | `tasks`, `task_categories`, `task_templates`, `task_attachments`, `recurring_tasks` |
| **Budget** | `budgets`, `budget_categories`, `expenses`, `expense_attachments` |
| **Vendors** | `vendors`, `quotations`, `vendor_payments`, `vendor_portfolio_images`, `vendor_contracts` |
| **Guests** | `guests`, `guest_categories` |
| **Documents** | `documents`, `document_shares` |
| **Gallery** | `image_gallery` |
| **Cultural** | `seserahan_items`, `cultural_rundowns`, `encyclopedia_entries` |
| **Events** | `events` |
| **Subscription** | `subscription_plans`, `subscriptions`, `payment_transactions`, `invoices` |
| **Notifications** | `notifications`, `push_notification_subscriptions`, `whatsapp_notifications` |
| **Comments** | `comments` |
| **Admin** | `support_tickets`, `support_ticket_messages`, `admin_contents` |
| **Calendar** | `calendar_syncs` |
| **Audit** | `activity_logs` |

### Migrasi Database

| Perintah | Fungsi |
| --- | --- |
| `npm run db:generate` | Buat migrasi dari perubahan schema |
| `npm run db:check` | Periksa konsistensi migrasi |
| `npm run db:migrate` | Terapkan migrasi yang sudah di-commit |
| `npm run db:studio` | Buka Drizzle Studio (GUI database) |

## 🔒 Keamanan

- **Row-Level Security (RLS)** — PostgreSQL RLS pada semua tabel workspace
- **Role-Based Access Control** — OWNER, PARTNER, FAMILY, COORDINATOR per workspace
- **Admin Role** — proteksi admin portal dengan role check
- **Auth.js** — session management dengan Google OAuth + Email/Password
- **Server Actions** — semua mutations melalui server actions dengan auth check
- **Input Validation** — Zod validation di semua server actions
- **Cron Job Protection** — secret-based authorization untuk cron endpoints

## 🧪 Testing

```powershell
# Jalankan semua tests
npm test

# Security tests (RLS isolation)
npm run test:security

# Auth tests
npm run test:auth
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository ke Vercel
2. Set environment variables di Vercel dashboard
3. Deploy — Vercel akan otomatis detect Next.js dan configure build

### Cron Jobs

Cron job untuk notification scheduler sudah dikonfigurasi di `vercel.json`:
- Endpoint: `/api/cron/notifications`
- Schedule: setiap jam (`0 * * * *`)
- Proteksi: `CRON_SECRET` di environment

### Database Production

- Gunakan PostgreSQL managed service (Neon, Supabase, Railway, dll)
- Pastikan mendukung Row-Level Security
- Jalankan migrasi setelah deploy
- Setup backup otomatis

## 📊 Status Proyek

| Metrik | Nilai |
|--------|-------|
| **Total Halaman** | 50+ |
| **Fitur PRD** | ~100% diimplementasikan |
| **Action Files** | 44+ |
| **Components** | 30+ |
| **Database Tables** | 28+ |
| **Migrations** | 34 files (0000-0033) |
| **Tests** | 23+ test cases (5 unit + 18 E2E) |

## 📄 Dokumentasi

- **[Technical Specs](docs/specs.md)** — Spesifikasi teknis lengkap
- **[Architecture](docs/architecture.md)** — Arsitektur aplikasi
- **[Feature Specifications](docs/specification.md)** — Detail setiap fitur
- **[Brand Guidelines](docs/sewaka_brand_guidelines.md)** — Panduan brand Sewaka
- **[PRD](docs/Sewaka_Product_Requirements_Document.md)** — Product Requirements Document
- **[Deployment Guide](docs/DEPLOYMENT.md)** — Panduan deploy ke Vercel production
- **[Post-Launch Guide](docs/POST-LAUNCH.md)** — Monitoring, maintenance, dan troubleshooting
- **[CI/CD Pipeline](docs/CICD.md)** — GitHub Actions workflows dan setup
- **[Security Audit](docs/SECURITY.md)** — Security architecture, vulnerability assessment, dan pentest checklist
- **[Changelog](CHANGELOG.md)** — Riwayat perubahan versi

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/featurnya`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push ke branch (`git push origin feature/featurnya`)
5. Submit Pull Request

## 📝 License

Proprietary — Sewaka © 2024

## 🆘 Support

Untuk pertanyaan atau masalah, buka support ticket di admin portal atau hubungi tim development.
