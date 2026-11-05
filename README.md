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

### 👥 Guest Management
- **Guest Database** — CRUD tamu dengan kategori dan RSVP
- **Guest Import/Export** — import CSV dan export data tamu
- **QR Code Generation** — generate QR code untuk setiap tamu
- **Check-in Scanner** — scan QR code di hari H pernikahan
- **Attendance Report** — laporan kehadiran dan RSVP summary
- **Digital Invitation** — halaman undangan publik dengan RSVP

### 📄 Documents & Gallery
- **Document Upload** — upload dan kelola file dokumen (50MB max)
- **Image Gallery** — gallery foto referensi pernikahan
- **File Preview** — preview image, PDF, video, audio langsung di browser
- **Document Sharing** — share dokumen via link dengan expiry

### 🎭 Cultural Features (Khas Sewaka!)
- **Seserahan Tracker** — kelola seserahan dan mahar adat
- **Cultural Rundown** — rundown acara pernikahan adat
- **Wedding Day Rundown** — timeline visual hari H
- **Cultural Encyclopedia** — ensiklopedia tradisi adat Nusantara
- **Timeline View** — view timeline semua acara dan rundown

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
| **Database** | PostgreSQL 16+ dengan Row-Level Security |
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
- PostgreSQL 16+
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
│   └── 0015_*.sql          # Latest migration
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
| **Migrations** | 16 files (0000-0015) |
| **Tests** | 23+ test cases (5 unit + 18 E2E) |

## 📄 Dokumentasi

- **[Technical Specs](docs/specs.md)** — Spesifikasi teknis lengkap
- **[Architecture](docs/architecture.md)** — Arsitektur aplikasi
- **[Feature Specifications](docs/specification.md)** — Detail setiap fitur
- **[Brand Guidelines](docs/sewaka_brand_guidelines.md)** — Panduan brand Sewaka
- **[PRD](docs/Wedora_Product_Requirements_Document.md)** — Product Requirements Document
- **[Deployment Guide](docs/DEPLOYMENT.md)** — Panduan deploy ke Vercel production
- **[Post-Launch Guide](docs/POST-LAUNCH.md)** — Monitoring, maintenance, dan troubleshooting
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
