# Changelog

All notable changes to the Sewaka project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Ready for Production
- All PRD features implemented (P0, P1, P2)
- 50+ pages compiled successfully
- 44+ action files, 22+ UI components, 28+ database tables

### Added
- **12 Tradisi Budaya Baru**: Memperluas Cultural Workflow Generator dari 4 menjadi 16 tradisi adat Nusantara
  - **Betawi** (Palang Pintu) — DKI Jakarta: pantun, silat, dan restu keluarga
  - **Batak Toba** — Sumatera Utara: ulos, gondang, dan persatuan marga
  - **Mandailing** (Horja) — Mandailing Natal: markobar, gondang, dan mangupa
  - **Aceh** (Peusijuek) — Aceh: doa, seulanga, dan restu keluarga
  - **Melayu Riau** — Riau dan Kepri: tepuk tepung tawar dan berbalas pantun
  - **Palembang** (Aesan Gede) — Sumatera Selatan: songket dan keagungan munggah
  - **Lampung Pepadun** — Lampung: siger, musyawarah, dan cangget
  - **Bugis** (Mappacci) — Sulawesi Selatan: mappacci dan kehormatan keluarga
  - **Bali Hindu** (Mekala-kalaan) — Bali: sekala-niskala dalam ikatan wiwaha
  - **Banjar** (Bapapai/Badudus) — Kalimantan Selatan: jujuran, mandi adat, dan batatai
  - **Sasak** (Sorong Serah & Nyongkolan) — Lombok, NTB: aji krame dan silaturahmi
  - **Dayak Ngaju** — Kalimantan Tengah: jalan hadat dan penghormatan keluarga

### Added
- **Premium Invitation Features**: Complete suite of digital invitation enhancements inspired by Attari
  - **Cover Page Animation**: Full-screen "Buka Undangan" cover with guest name personalization and auto-play music
  - **Love Story Timeline**: Visual timeline with milestones (date, title, description, photo) replacing plain text story
  - **Hero Photo Carousel**: Multiple hero photos with auto-slide (5s) and dots navigation
  - **Custom Font & Background**: 5 Google Fonts choices (Playfair Display, Great Vibes, etc.) and custom background image
  - **Love Animation**: Floating hearts CSS animation on scroll, toggleable via admin
  - **Event Countdown**: Real-time countdown per event, highlighting the nearest upcoming event
  - **Cashless Gift (Kado Digital)**: Multiple gift accounts (bank/e-wallet) with copy-to-clipboard
  - **Video Gallery**: YouTube embed for couple's video memories
  - **Live Streaming**: External live stream link section
  - **Share WhatsApp**: Personalized WhatsApp share button with template messages
  - **Bulk WhatsApp Invite**: Mass invitation via WhatsApp from admin (max 50/batch, rate limited)
- **Cultural Workflow Generator** (P1 — USP Fitur): Auto-generate lengkap dari pilih tradisi → rundown, seserahan, checklist
  - **Tradition Selector**: Card picker 16 tradisi (Jawa, Sunda, Minang, Nasional, Betawi, Batak Toba, Mandailing, Aceh, Melayu Riau, Palembang, Lampung Pepadun, Bugis, Bali, Banjar, Sasak, Dayak Ngaju) dengan preview
  - **Auto Rundown**: Generate rundown adat lengkap dengan rituals, PIC, lokasi, attire dari template
  - **Auto Seserahan**: Generate daftar seserahan dari encyclopedia ubarampe per tradisi
  - **Auto Checklist**: Generate tasks dari checklist template per tradisi dengan milestone & priority
  - **Idempotent**: Generate ulang aman — skip jika sudah ada data
  - **Reset Workflow**: Hapus data yang sudah di-generate untuk generate ulang
  - **Task Source Tracking**: Kolom `source` di tasks untuk track asal: MANUAL, CULTURAL_WORKFLOW, ENCYCLOPEDIA
  - **Encyclopedia CTA**: Banner di Ensiklopedia Adat mengarah ke Workflow Generator
  - **Onboarding CTA**: Button di step terakhir onboarding untuk langsung generate workflow
- **QR Check-in Offline** (P0): Offline-first check-in queue dengan auto-sync saat online kembali
  - **LocalStorage Queue**: Simpan check-in saat offline, max 100 entries per workspace
  - **Auto-Sync**: Navigator.onLine detection, exponential backoff retry (1s→2s→4s→8s)
  - **Batch Sync API**: Server action + endpoint untuk sync multiple offline check-ins, idempotent
  - **Audit Log**: Tabel check_in_logs untuk track semua check-in (online/offline/sync/conflict)
  - **Scanner Component**: Online/offline badge, auto-enqueue saat offline, manual search tamu
- **WhatsApp RSVP Automation** (P0): Sistem tracking WhatsApp messages dan reminder otomatis
  - **Message Tracking**: Simpan history WhatsApp per tamu dengan status (PENDING, SENT, DELIVERED, READ, FAILED)
  - **Template Pesan**: Personalisasi dengan {guest_name}, {couple_name}, {invite_link}
  - **Bulk Send**: Kirim ke banyak tamu sekaligus (max 50/batch)
  - **Stats Dashboard**: Monitoring sent, delivered, read, failed per workspace
  - **Reminder Otomatis**: Reminder 7 hari dan 1 hari sebelum wedding date
- **Seating Planner** (P1): Seat assignment dan meja management
  - **Table CRUD**: Buat, edit, hapus meja dengan kapasitas dan posisi
  - **Seat Assignment**: Assign tamu ke meja dengan seat number
  - **Capacity Tracking**: Monitor occupied vs available seats per meja
  - **Visual Layout**: Table cards dengan posisi X/Y untuk layout visual
- **Wedding Day Command Center** (P1): Koordinasi hari H real-time
  - **Team Management**: CRUD kru dan vendor dengan role, phone, dan status
  - **Incident Tracking**: Laporkan dan track insiden dengan severity (LOW, MEDIUM, HIGH, CRITICAL)
  - **Status Grid**: Monitor status kru (ON_TIME, DELAYED, COMPLETED, ISSUE)
  - **Incident Feed**: Timeline insiden dengan filter severity dan status
- **PWA Support**: Manifest, service worker, offline support, installable on mobile/desktop
- **Web Vitals Monitoring**: LCP, INP, CLS tracking with `web-vitals` library
- **E2E Testing**: Playwright tests for auth, UI, and all major flows (18 test cases)
- **Cloud Storage**: Vercel Blob integration for file uploads (gallery, documents, contracts)
- **QR Code Generator**: Real QR code generation using `qrcode` library
- **Cron Job**: Notification scheduler endpoint with hourly schedule
- **Email Templates**: 5 HTML templates (verification, password reset, task reminder, budget alert, event reminder)
- **Admin RBAC**: Role-based access control for admin portal
- **Rate Limiting**: In-memory rate limiting for checkout, webhook, check-in, auth, and email routes
- **Redis Rate Limiting** (P0): Upgraded to Upstash Redis with sliding window algorithm for distributed rate limiting
  - **Sliding Window Log**: More accurate than fixed window, using Redis Sorted Sets
  - **Graceful Fallback**: Falls back to in-memory if Redis is unavailable
  - **Zero Downtime**: No blocking if Redis fails, continues with in-memory protection
- **Image Optimization**: Next.js Image component for gallery and vendor portfolio
- **Data Caching**: In-memory cache with TTL for data fetching
- **Mobile Responsiveness**: Hamburger menu, mobile sidebar overlay, touch-friendly UI
- **Accessibility**: Skip navigation, ARIA labels, keyboard navigation (WCAG 2.1 AA)
- **SEO**: Sitemap.xml and robots.txt auto-generation
- **Health Check**: `/api/v1/health` endpoint for monitoring
- **Service Worker**: Cache-first for static assets, network-first for API calls
- **Offline Page**: Fallback page when offline
- **8 UI Components**: Skeleton, Select, Table, Dropdown Menu, Sheet, Tooltip, Accordion, Command
- **Bundle Optimization**: Removed unused recharts package (35 packages removed)
- **WhatsApp Reminder Cron Job**: Otomatis kirim reminder WhatsApp 7 hari dan 1 hari sebelum wedding date
  - **Cron Endpoint**: `/api/cron/whatsapp-reminders` berjalan setiap jam via Vercel Cron
  - **Auto Detection**: Query workspace dengan wedding_date dalam 7 hari dan 1 hari
  - **Duplicate Prevention**: Skip tamu yang sudah pernah dapat reminder 7D
  - **Personalized Message**: Template dengan {guest_name}, {couple_name}, {invite_link}
- **Check-in Audit Logs UI**: Admin dashboard untuk monitor check-in audit logs
  - **Audit Log Table**: Tabel dengan filter: nama tamu, sync status, tanggal range
  - **Stats Cards**: Total logs, synced, pending, failed
  - **Pagination**: 20 logs per halaman dengan previous/next
  - **Export CSV**: Download audit logs ke file CSV
  - **Navigation**: Menu "Audit Logs Check-in" di sidebar section ACARA
- **Dashboard Analytics**: Insight visual RSVP, budget, attendance, dan vendor
  - **RSVP Chart**: Progress bar dengan persentase Hadir, Tidak Hadir, Pending
  - **Budget Chart**: Progress bar per kategori dengan warna hijau/kuning/merah
  - **Attendance Chart**: Bar chart check-in tamu 7 hari terakhir
  - **Vendor Table**: Rekomendasi vendor kurasi dengan rating
  - **Navigation**: Menu "Analytics" di sidebar section UTAMA
- **P2 Features**: Fitur tambahan untuk meningkatkan pengalaman undangan
  - **Invitation Themes Gallery**: 12+ theme templates lengkap (Emas, Burgundy, Sage, Rose, Navy, Minimalist, Floral, Geometric, Vintage, Tropical, Luxury, Pastel)
  - **Custom Email Templates**: Kirim undangan via email dengan HTML template personal via Resend
  - **Guest Photo Upload**: Tamu bisa upload foto di undangan public dengan moderation admin
  - **E2E Tests**: Playwright tests untuk invitation, check-in, dan RSVP flow
- **Berkas Nikah KUA/Catatan Sipil** (P1): Modul dokumen administratif pernikahan Indonesia
  - **Checklist Adaptif**: Template checklist berdasarkan jenis nikah (SIPIL, AGAMA, KUA)
  - **Progress Tracking**: Progress bar dan status per dokumen (Wajib/Opsional)
  - **File Upload**: Upload berkas per dokumen dengan deadline tracking
  - **Generate dari Template**: 10-12 dokumen per jenis nikah dengan deskripsi lengkap
- **Vendor Marketplace Enhancement** (P1): Inquiry system dan review/rating vendor
  - **Inquiry System**: Kirim inquiry ke vendor via Email, Telepon, atau WhatsApp
  - **Review & Rating**: Rating 1-5 bintang dengan review text opsional
  - **Rate Limiting**: Max 5 inquiry per menit untuk mencegah abuse
  - **Duplicate Prevention**: Satu review per workspace per vendor
- **Guest Thank You Automation** (P2): Otomatis kirim ucapan terima kasih ke tamu
  - **Template Pesan**: Template dengan placeholder {guestName} dan {coupleName}
  - **Batch Generate**: Generate pesan untuk semua tamu sekaligus
  - **Multi Channel**: Support WhatsApp dan Email
  - **Status Tracking**: Monitor status (PENDING, SENT, FAILED) per pesan
  - **WhatsApp Link**: Tombol "Buka WA" per tamu untuk kirim pesan langsung
  - **Guest Info**: Tampilkan nama tamu di daftar pesan
- **Final Integration & Polish**: Menutup semua gap yang tersisa
  - **Vendor Inquiry Integration**: Tombol "Kirim Inquiry" dan "Review" di setiap vendor card
  - **Vendor Inquiry List**: Halaman inquiry history dengan filter status dan update status
  - **Guest Thank You WhatsApp**: Generate WhatsApp URL scheme per tamu untuk kirim pesan
  - **Guest Thank You Email**: Support email via Resend API (jika RESEND_API_KEY tersedia)
- **Performance Audit**: Optimasi performa halaman undangan public
  - **Bundle Optimization**: Dynamic import `qrcode` library (mengurangi initial bundle size ~30KB)
  - **Code Splitting**: Lazy load HeroCarousel, StoryTimeline, LoveAnimation dengan Suspense fallback
  - **Image Optimization**: Next.js `<Image>` component untuk gallery, hero carousel, dan story timeline
  - **Caching Strategy**: Revalidate 3600s untuk invitation pages, cache headers untuk static assets
  - **SEO Optimization**: Open Graph dynamic image, Twitter Cards, JSON-LD structured data (WeddingEvent)
  - **Canonical URLs**: Alternates canonical untuk setiap invitation page

### Changed
- **Email Domain**: MAIL_FROM set to `noreply@sndwbites.net`
- **Database**: Added 20+ new tables for feature support
- **Invitation Customization**: Extended with 8 new columns (`gift_accounts`, `video_url`, `live_stream_url`, `story_timeline`, `custom_font`, `background_image_url`, `hero_photo_urls`, `enable_animations`)
- **Guests Table**: Extended with audit fields (`checked_in_by`, `checked_in_device`) for offline check-in
- **Tasks Table**: Extended with `source` column to track task origin (MANUAL, CULTURAL_WORKFLOW, ENCYCLOPEDIA)
- **Check-in Logs**: New table `check_in_logs` with 4 indexes for full audit trail
- **WhatsApp Messages**: New table `whatsapp_messages` dengan 3 indexes untuk tracking
- **Seating Planner**: New tables `seating_tables` dan `seat_assignments` dengan 3 indexes
- **Command Center**: New tables `command_center_team` dan `command_center_incidents` dengan 2 indexes
- **Guest Photos**: New table `guest_photos` dengan 2 indexes untuk upload foto tamu
- **Nikah Berkas**: New table `nikah_berkas` dengan 2 indexes untuk checklist dokumen nikah
- **Vendor Inquiries**: New table `vendor_inquiries` dengan 2 indexes untuk inquiry ke vendor
- **Vendor Reviews**: New table `vendor_reviews` dengan 1 index dan rating check constraint
- **Guest Thank You**: New table `guest_thank_you` dengan 2 indexes untuk thank you messages
- **Public Invitation UI**: Complete redesign with cover page, timeline, carousel, animations, and countdown
- **Sidebar**: Updated to 26 menu items including Analytics, Audit Logs Check-in, Workflow Adat, WhatsApp RSVP, Seating Planner, Command Center, Guest Thank You, Berkas Nikah, Vendor Inquiry
- **Dashboard**: Added wedding countdown, quick actions, budget overview, tasks, events, guests, vendors

### Security Fixes
- **Migration 0027**: Added missing public RLS policies `guests_public_check_in_update` dan `check_in_logs_public_insert` untuk check-in API
- **Security Audit**: Verified RLS transaction scope, Midtrans webhook HMAC-SHA512 signature, dan rate limiting
- **Redis Rate Limiting**: Upgraded from in-memory to Upstash Redis for distributed rate limiting across serverless instances

### Security
- **Rate Limiting**: 5/min for checkout, 30/min for webhook, 20/min for check-in
- **Bulk WhatsApp Rate Limit**: Max 50 guests per batch to prevent abuse
- **Admin RBAC**: Only users with `role = 'admin'` can access `/admin/*`
- **Environment Variables**: Comprehensive `.gitignore` with 13 categories
- **Input Validation**: Zod schemas for form validation
- **JSONB Sanitization**: All new JSONB fields (`story_timeline`, `hero_photo_urls`, `gift_accounts`) are sanitized with length limits on save

## [0.1.0] - 2024-11-05

### Initial Release
- Authentication (sign in, sign up, forgot password, email verification)
- Wedding workspace setup and onboarding wizard
- Task management with categories, templates, priority, status
- Budget and expense management with reports
- Vendor management with quotations and payments
- Guest management with RSVP, import/export, QR code
- Document management with upload and sharing
- Cultural features: Seserahan, Rundown, Encyclopedia
- Subscription and payment integration (Midtrans)
- Admin portal with user, workspace, plan management
- Notification system (email, push, WhatsApp)
- Calendar and timeline views
- Image gallery and vendor portfolio
- Contract management
- Comments system
- Settings and account management

[Unreleased]: https://github.com/sewaka/sewaka-web/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sewaka/sewaka-web/releases/tag/v0.1.0
