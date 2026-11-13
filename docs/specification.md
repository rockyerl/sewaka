# Feature Specifications — Sewaka

Dokumen ini berisi spesifikasi detail setiap fitur yang diimplementasikan di
Sewaka — platform perencanaan pernikahan untuk adat Nusantara.

---

## 1. Authentication (AUTH)

### AUTH-01: Sign Up with Email/Password

**User Story:** Sebagai pengguna baru, saya ingin mendaftar dengan email dan password agar bisa menggunakan Sewaka.

**Acceptance Criteria:**
- [x] Form dengan email, password, confirm password, nama lengkap
- [x] Validasi email format
- [x] Password minimal 8 karakter
- [x] Password hashing dengan bcryptjs
- [x] Create user di database
- [x] Auto-login setelah registrasi
- [x] Redirect ke onboarding wizard

**Implementation:**
- File: `features/auth/actions/auth-actions.ts`
- Schema: `users` table
- UI: Sign-up page di `app/auth/`

---

### AUTH-02: Sign In with Email/Password

**User Story:** Sebagai pengguna terdaftar, saya ingin login dengan email dan password.

**Acceptance Criteria:**
- [x] Form dengan email dan password
- [x] Password verification dengan bcryptjs
- [x] Session creation via Auth.js
- [x] Redirect ke dashboard setelah login
- [x] Error message untuk kredensial salah

**Implementation:**
- File: `features/auth/actions/auth-actions.ts`
- UI: Sign-in page di `app/auth/signin/`

---

### AUTH-03: Google Sign-In

**User Story:** Sebagai pengguna, saya ingin login dengan akun Google untuk kemudahan.

**Acceptance Criteria:**
- [x] Google OAuth integration via Auth.js
- [x] Auto-create user jika pertama kali
- [x] Link existing account jika email sudah terdaftar
- [x] Session creation
- [x] Redirect ke dashboard atau onboarding

**Implementation:**
- File: `auth.ts` (Auth.js config)
- Config: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- UI: Google sign-in button di sign-in page

---

### AUTH-04: Email Verification

**User Story:** Sebagai pengguna baru, saya ingin memverifikasi email saya.

**Acceptance Criteria:**
- [x] Generate 6-digit verification code
- [x] Send email via Resend dengan template
- [x] Input code untuk verifikasi
- [x] Code expiry (10 menit)
- [x] One-time use code
- [x] Resend code capability

**Implementation:**
- File: `features/auth/actions/email-verification-actions.ts`
- Schema: `verification_tokens` table
- UI: `app/auth/verify-email/`
- Template: `lib/email-templates.ts` (verificationEmailTemplate)

---

### AUTH-05: Forgot Password

**User Story:** Sebagai pengguna, saya ingin mereset password jika lupa.

**Acceptance Criteria:**
- [x] Input email untuk request reset
- [x] Generate reset token
- [x] Send email dengan reset link
- [x] Reset password page dengan token
- [x] New password validation
- [x] Invalidate old sessions

**Implementation:**
- File: `features/auth/actions/password-actions.ts`
- Schema: `verification_tokens` table
- UI: `app/auth/forgot-password/`, `app/auth/reset-password/`
- Template: `lib/email-templates.ts` (passwordResetTemplate)

---

### AUTH-10: Account Deactivation

**User Story:** Sebagai pengguna, saya ingin menonaktifkan akun saya.

**Acceptance Criteria:**
- [x] Konfirmasi deactivation
- [x] Soft delete (anonymization)
- [x] Invalidate semua sessions
- [x] Revoke semua workspace access
- [x] Anonimize user data

**Implementation:**
- File: `features/auth/actions/account-actions.ts`
- UI: `app/(app)/settings/` (Danger zone)

---

## 2. Workspace (WKS)

### WKS-01: Create Wedding Workspace

**User Story:** Sebagai pengguna, saya ingin membuat workspace pernikahan.

**Acceptance Criteria:**
- [x] Form dengan nama pasangan, tanggal pernikahan, lokasi
- [x] Auto-create OWNER member
- [x] Generate unique slug untuk invitation
- [x] Workspace settings (quote, dress code, story)

**Implementation:**
- File: `features/workspaces/actions/workspace-actions.ts`
- Schema: `workspaces`, `workspace_members`
- UI: Onboarding wizard atau workspace page

---

### WKS-02: Invite Partner

**User Story:** Sebagai OWNER, saya ingin mengundang pasangan saya ke workspace.

**Acceptance Criteria:**
- [x] Input email partner
- [x] Send invitation email
- [x] Role assignment (PARTNER)
- [x] Accept/decline invitation

**Implementation:**
- File: `features/workspaces/actions/member-actions.ts`
- Schema: `workspace_members`

---

### WKS-03: Role Management

**User Story:** Sebagai OWNER/PARTNER, saya ingin mengelola role anggota workspace.

**Acceptance Criteria:**
- [x] Role hierarchy: OWNER > PARTNER > COORDINATOR > FAMILY
- [x] Add/update/delete collaborator
- [x] Role-based permissions
- [x] OWNER dan PARTNER bisa manage members
- [x] COORDINATOR bisa create/edit
- [x] FAMILY read-only

**Implementation:**
- File: `features/workspaces/actions/member-actions.ts`
- Schema: `workspace_members` dengan `workspace_role` enum
- RLS: PostgreSQL policies per role

---

### WKS-04: Wedding Concept

**User Story:** Sebagai pasangan, saya ingin mengatur tema dan konsep pernikahan.

**Acceptance Criteria:**
- [x] Pilih preset tema atau custom
- [x] Palet warna kustom
- [x] Deskripsi konsep
- [x] Simpan dan update konsep

**Implementation:**
- File: `features/workspaces/actions/concept-actions.ts`
- Schema: `wedding_concepts`
- UI: `features/workspaces/components/wedding-concept-panel.tsx`

---

### WKS-06: Wedding Countdown

**User Story:** Sebagai pasangan, saya ingin melihat countdown menuju hari pernikahan.

**Acceptance Criteria:**
- [x] Live countdown (hari, jam, menit, detik)
- [x] Tampil di dashboard hero section
- [x] Update real-time setiap detik
- [x] Handle hydration mismatch

**Implementation:**
- File: `features/dashboard/components/wedding-countdown.tsx`
- UI: Integrated di `app/(app)/dashboard/page.tsx`

---

### WKS-09: Onboarding Wizard

**User Story:** Sebagai pengguna baru, saya ingin dipandu setup workspace.

**Acceptance Criteria:**
- [x] Multi-step wizard (5 langkah)
- [x] Step 1: Profil pasangan
- [x] Step 2: Tanggal & lokasi pernikahan
- [x] Step 3: Tradisi adat
- [x] Step 4: Undang partner
- [x] Step 5: Selesai
- [x] Progress indicator
- [x] Skip dan resume capability

**Implementation:**
- File: `features/workspaces/components/onboarding-wizard.tsx`
- API: `app/api/v1/workspaces/onboarding/route.ts`
- UI: `app/(app)/onboarding/page.tsx`

---

## 3. Dashboard (DSH)

### DSH-01-09: Dashboard Lengkap

**User Story:** Sebagai pasangan, saya ingin melihat ringkasan semua aspek pernikahan di satu halaman.

**Acceptance Criteria:**
- [x] Wedding countdown timer
- [x] Quick actions shortcuts ke semua modul
- [x] Budget overview (total vs spent)
- [x] Upcoming tasks (due soon)
- [x] Upcoming events
- [x] Guest RSVP summary
- [x] Vendor overview (booked vs shortlisted)
- [x] Activity log viewer
- [x] Calendar view

**Implementation:**
- File: `app/(app)/dashboard/page.tsx`
- Components: `wedding-countdown.tsx`, `activity-log.tsx`, quick actions

---

## 4. Tasks (TSK)

### TSK-01: Checklist Templates

**User Story:** Sebagai pasangan, saya ingin menggunakan template checklist.

**Acceptance Criteria:**
- [x] Pre-defined task templates
- [x] Offset days dari tanggal pernikahan
- [x] Apply template ke workspace
- [x] Auto-generate tasks dari template

**Implementation:**
- File: `features/tasks/actions/task-actions.ts`
- Schema: `task_templates`

---

### TSK-03: Task Categories

**User Story:** Sebagai pasangan, saya ingin mengkategorikan tasks.

**Acceptance Criteria:**
- [x] Create/update/delete categories
- [x] Assign task ke category
- [x] Filter tasks by category

**Implementation:**
- File: `features/tasks/actions/task-actions.ts`
- Schema: `task_categories`

---

### TSK-04: Task Assignment

**User Story:** Sebagai OWNER, saya ingin assign task ke anggota workspace.

**Acceptance Criteria:**
- [x] Assign task ke member
- [x] View assigned tasks
- [x] Filter by assignee

**Implementation:**
- File: `features/tasks/actions/task-actions.ts`
- Schema: `tasks.assignedToId`

---

### TSK-06: Task Priority

**User Story:** Sebagai pasangan, saya ingin menandai prioritas task.

**Acceptance Criteria:**
- [x] Priority levels: LOW, MEDIUM, HIGH
- [x] Badge visual per prioritas
- [x] Filter dan sort by priority
- [x] Update priority dari task row

**Implementation:**
- File: `features/tasks/actions/task-actions.ts`
- Schema: `tasks.priority` (enum)
- UI: `features/tasks/components/task-row.tsx`

---

### TSK-08: Task Reminder

**User Story:** Sebagai pasangan, saya ingin mendapat reminder untuk task yang akan due.

**Acceptance Criteria:**
- [x] Automatic reminder 24 jam sebelum due date
- [x] Email notification
- [x] Push notification
- [x] WhatsApp notification (optional)
- [x] Cron job scheduler setiap jam

**Implementation:**
- File: `features/notifications/actions/notification-scheduler.ts`
- Cron: `app/api/cron/notifications/route.ts`
- Config: `vercel.json`

---

### TSK-09: Task Notes

**User Story:** Sebagai pasangan, saya ingin menambahkan catatan ke task.

**Acceptance Criteria:**
- [x] Text field untuk notes
- [x] Save notes per task
- [x] View notes di task detail

**Implementation:**
- File: `features/tasks/actions/task-actions.ts`
- Schema: `tasks.notes` (text field)

---

### TSK-10: Task Attachments

**User Story:** Sebagai pasangan, saya ingin melampirkan file ke task.

**Acceptance Criteria:**
- [x] Upload file ke task
- [x] Multiple attachments per task
- [x] Delete attachment
- [x] File preview

**Implementation:**
- File: `features/tasks/actions/attachment-actions.ts`
- Schema: `task_attachments`
- Storage: Vercel Blob via `lib/storage.ts`

---

### TSK-11: Recurring Tasks

**User Story:** Sebagai pasangan, saya ingin task yang berulang otomatis dibuat.

**Acceptance Criteria:**
- [x] Recurring patterns: DAILY, WEEKLY, BIWEEKLY, MONTHLY
- [x] Auto-generate tasks dari recurring definition
- [x] Start dan end date
- [x] Manage recurring tasks

**Implementation:**
- File: `features/tasks/actions/recurring-actions.ts`
- Schema: `recurring_tasks`

---

## 5. Budget (BGT)

### BGT-01: Budget Planning

**User Story:** Sebagai pasangan, saya ingin menetapkan total anggaran pernikahan.

**Acceptance Criteria:**
- [x] Set total budget amount
- [x] Update budget
- [x] Display budget di dashboard

**Implementation:**
- File: `features/budget/actions/budget-actions.ts`
- Schema: `budgets`

---

### BGT-02: Budget Categories

**User Story:** Sebagai pasangan, saya ingin mengalokasikan anggaran per kategori.

**Acceptance Criteria:**
- [x] Create/update/delete categories
- [x] Allocated amount per category
- [x] Track spending per category

**Implementation:**
- File: `features/budget/actions/budget-actions.ts`
- Schema: `budget_categories`

---

### BGT-03: Expense Recording

**User Story:** Sebagai pasangan, saya ingin mencatat pengeluaran.

**Acceptance Criteria:**
- [x] Record expense dengan amount, category, date
- [x] Update/delete expense
- [x] Link expense ke budget category

**Implementation:**
- File: `features/budget/actions/expense-actions.ts`
- Schema: `expenses`

---

### BGT-10: Financial Reports

**User Story:** Sebagai pasangan, saya ingin melihat laporan keuangan lengkap.

**Acceptance Criteria:**
- [x] Total anggaran vs pengeluaran
- [x] Perbandingan estimasi vs realisasi per kategori
- [x] Progress bar penggunaan anggaran
- [x] Warning jika melebihi budget
- [x] Riwayat pengeluaran terbaru

**Implementation:**
- File: `features/budget/queries/financial-queries.ts`
- UI: `app/(app)/budget/financial/page.tsx`

---

### BGT-11: Budget Export

**User Story:** Sebagai pasangan, saya ingin export laporan keuangan ke CSV.

**Acceptance Criteria:**
- [x] Generate CSV dari data budget dan expense
- [x] Download file CSV
- [x] Include summary dan detail

**Implementation:**
- File: `features/budget/actions/budget-export-actions.ts`
- UI: Button di financial report page

---

### BGT-12: Budget Comparison Chart

**User Story:** Sebagai pasangan, saya ingin melihat visualisasi perbandingan budget.

**Acceptance Criteria:**
- [x] Progress bars per kategori
- [x] Estimated vs actual comparison
- [x] Summary cards

**Implementation:**
- File: `features/budget/actions/budget-comparison-actions.ts`
- UI: `features/budget/components/budget-comparison-chart.tsx`

---

### BGT-13: Expense Attachments

**User Story:** Sebagai pasangan, saya ingin melampirkan bukti bayar ke expense.

**Acceptance Criteria:**
- [x] Upload file ke expense
- [x] Multiple attachments
- [x] Delete attachment
- [x] File preview

**Implementation:**
- File: `features/budget/actions/expense-attachment-actions.ts`
- Schema: `expense_attachments`
- Storage: Vercel Blob

---

## 6. Vendors (VND)

### VND-01: Vendor Directory

**User Story:** Sebagai pasangan, saya ingin membuat database vendor pribadi.

**Acceptance Criteria:**
- [x] CRUD vendor (nama, kontak, email, phone, notes)
- [x] Vendor categories
- [x] Search dan filter vendor

**Implementation:**
- File: `features/vendors/actions/vendor-actions.ts`
- Schema: `vendors`
- UI: `app/(app)/vendors/page.tsx`

---

### VND-03: Vendor Status

**User Story:** Sebagai pasangan, saya ingin melacak status vendor.

**Acceptance Criteria:**
- [x] Status: SHORTLISTED, CONTACTED, BOOKED
- [x] Update status vendor
- [x] Filter by status

**Implementation:**
- File: `features/vendors/actions/vendor-actions.ts`
- Schema: `vendors.status` (enum)

---

### VND-04: Vendor Portfolio

**User Story:** Sebagai pasangan, saya ingin melihat portfolio vendor.

**Acceptance Criteria:**
- [x] Upload portfolio images
- [x] Gallery view di vendor detail
- [x] Delete images

**Implementation:**
- File: `features/vendors/actions/portfolio-actions.ts`
- Schema: `vendor_portfolio_images`
- UI: `app/(app)/vendors/[id]/page.tsx`

---

### VND-06: Vendor Comparison

**User Story:** Sebagai pasangan, saya ingin membandingkan penawaran vendor.

**Acceptance Criteria:**
- [x] Compare vendors per kategori
- [x] Show quotation comparison
- [x] Display status, harga, dan kontak

**Implementation:**
- File: `features/vendors/actions/vendor-comparison-actions.ts`
- API: `app/api/v1/vendors/comparison/route.ts`
- UI: `features/vendors/components/vendor-comparison.tsx`

---

### VND-08: Quotation Management

**User Story:** Sebagai pasangan, saya ingin mengelola quotation dari vendor.

**Acceptance Criteria:**
- [x] Create quotation
- [x] Update quotation
- [x] Accept/reject quotation
- [x] Delete quotation

**Implementation:**
- File: `features/vendors/actions/quotation-actions.ts`
- Schema: `quotations`

---

### VND-10: Vendor Payments

**User Story:** Sebagai pasangan, saya ingin melacak pembayaran vendor (DP dan final).

**Acceptance Criteria:**
- [x] Record DP payment
- [x] Record final payment
- [x] Payment status tracking
- [x] Payment history

**Implementation:**
- File: `features/vendors/actions/payment-actions.ts`
- Schema: `vendor_payments`

---

### VND-09: Contract Management

**User Story:** Sebagai pasangan, saya ingin menyimpan kontrak vendor.

**Acceptance Criteria:**
- [x] Upload contract file (PDF, max 20MB)
- [x] List contracts per vendor
- [x] Delete contract
- [x] Mark contract as signed

**Implementation:**
- File: `features/contracts/actions/contract-actions.ts`
- Schema: `vendor_contracts`
- UI: `app/(app)/contracts/page.tsx`
- Storage: Vercel Blob

---

## 7. Guests (GST)

### GST-01: Guest Database

**User Story:** Sebagai pasangan, saya ingin mengelola daftar tamu.

**Acceptance Criteria:**
- [x] CRUD guests (nama, kategori, RSVP, plus ones)
- [x] Guest categories
- [x] Invitation code per guest
- [x] RSVP status: PENDING, ACCEPTED, DECLINED

**Implementation:**
- File: `features/guests/actions/guest-actions.ts`
- Schema: `guests`, `guest_categories`
- UI: `app/(app)/guests/page.tsx`

---

### GST-03: Guest Import/Export

**User Story:** Sebagai pasangan, saya ingin import/export data tamu.

**Acceptance Criteria:**
- [x] Import dari CSV
- [x] Download CSV template
- [x] Export ke CSV
- [x] Validation import data
- [x] Error handling untuk invalid rows

**Implementation:**
- File: `features/guests/actions/guest-import-export-actions.ts`
- UI: Import modal di guest list view

---

### GST-08: QR Code Generation

**User Story:** Sebagai pasangan, saya ingin generate QR code untuk tamu.

**Acceptance Criteria:**
- [x] Generate QR code dari invitation code
- [x] Download QR code sebagai PNG
- [x] Copy invitation code
- [x] Bulk generate untuk semua tamu

**Implementation:**
- File: `features/guests/components/qr-code-generator.tsx`
- Library: `qrcode`
- UI: Modal di guest list

---

### GST-09: Guest Check-in Scanner

**User Story:** Sebagai coordinator, saya ingin scan QR code tamu di hari H.

**Acceptance Criteria:**
- [x] Manual input invitation code
- [x] Validate code
- [x] Mark guest as checked-in
- [x] Display check-in status

**Implementation:**
- File: `features/guests/components/check-in-scanner.tsx`
- API: `app/api/v1/guests/check-in/route.ts`
- UI: `app/(app)/wedding-day/page.tsx`

---

### GST-10: Attendance Report

**User Story:** Sebagai pasangan, saya ingin melihat laporan kehadiran tamu.

**Acceptance Criteria:**
- [x] RSVP summary (total, confirmed, declined, pending)
- [x] Check-in progress
- [x] Attendance per kategori
- [x] Recent check-ins list

**Implementation:**
- File: `features/guests/queries/attendance-queries.ts`
- UI: `app/(app)/guests/attendance/page.tsx`

---

## 8. Documents (DOC)

### DOC-01: Document Upload

**User Story:** Sebagai pasangan, saya ingin mengupload dokumen pernikahan.

**Acceptance Criteria:**
- [x] Upload file (max 50MB)
- [x] File categories
- [x] Delete document
- [x] List documents

**Implementation:**
- File: `features/documents/actions/document-upload-actions.ts`
- Schema: `documents`
- UI: `app/(app)/documents/page.tsx`
- Storage: Vercel Blob

---

### DOC-03: Image Gallery

**User Story:** Sebagai pasangan, saya ingin menyimpan foto referensi pernikahan.

**Acceptance Criteria:**
- [x] Upload images (max 10MB)
- [x] Grid view gallery
- [x] Delete images
- [x] Preview images

**Implementation:**
- File: `features/gallery/actions/gallery-actions.ts`
- Schema: `image_gallery`
- UI: `app/(app)/gallery/page.tsx`
- Storage: Vercel Blob

---

### DOC-06: Document Sharing

**User Story:** Sebagai pasangan, saya ingin share dokumen ke non-member.

**Acceptance Criteria:**
- [x] Generate share link
- [x] Link expiry (7 hari)
- [x] Access document via link

**Implementation:**
- File: `features/documents/actions/share-actions.ts`
- Schema: `document_shares`

---

### DOC-07: File Preview

**User Story:** Sebagai pasangan, saya ingin preview file langsung di browser.

**Acceptance Criteria:**
- [x] Preview images
- [x] Preview PDFs
- [x] Preview videos
- [x] Preview audio
- [x] Dialog modal untuk preview

**Implementation:**
- File: `features/documents/actions/file-preview-actions.ts`
- UI: `features/documents/components/file-preview-dialog.tsx`

---

## 9. Cultural Features (Khas Sewaka)

### SES-01: Seserahan Tracker

**User Story:** Sebagai pasangan, saya ingin mengelola daftar seserahan dan mahar.

**Acceptance Criteria:**
- [x] CRUD seserahan items
- [x] Box number
- [x] Giver party (GROOM_TO_BRIDE / BRIDE_TO_GROOM)
- [x] Estimated vs actual cost
- [x] Status tracking (PLANNED, dll)

**Implementation:**
- File: `features/seserahan/actions/seserahan-actions.ts`
- Schema: `seserahan_items`
- UI: `app/(app)/seserahan/page.tsx`

---

### RUN-01: Cultural Rundown

**User Story:** Sebagai pasangan, saya ingin membuat rundown acara pernikahan adat.

**Acceptance Criteria:**
- [x] CRUD rundown items
- [x] Ceremony type, time start/end
- [x] PIC, location, attire
- [x] Rituals (JSON), notes, sort order
- [x] Link ke wedding events

**Implementation:**
- File: `features/rundown/actions/rundown-actions.ts`
- Schema: `cultural_rundowns`
- UI: `app/(app)/wedding-day/page.tsx`

---

### ENC-01: Cultural Encyclopedia

**User Story:** Sebagai pasangan, saya ingin belajar tentang tradisi adat pernikahan.

**Acceptance Criteria:**
- [x] View encyclopedia entries
- [x] Search dan filter
- [x] Detail view per entry

**Implementation:**
- File: `features/encyclopedia/queries/encyclopedia-queries.ts`
- Schema: `encyclopedia_entries`
- UI: `app/(app)/encyclopedia/page.tsx`

---

### CAL-07: Wedding Day Rundown

**User Story:** Sebagai pasangan, saya ingin melihat timeline hari H pernikahan.

**Acceptance Criteria:**
- [x] Timeline visual rundown
- [x] Badge jenis acara (Akad, Resepsi, Seserahan)
- [x] Detail PIC, lokasi, busana, catatan, ritual
- [x] Check-in scanner integration

**Implementation:**
- File: `app/(app)/wedding-day/page.tsx`
- Components: `check-in-scanner.tsx`

---

### CAL-04: Timeline View

**User Story:** Sebagai pasangan, saya ingin melihat timeline semua acara.

**Acceptance Criteria:**
- [x] Combine events dan rundowns
- [x] Timeline visual
- [x] Sort by date/time

**Implementation:**
- File: `app/(app)/timeline/page.tsx`
- Queries: `event-actions.ts`, `rundown-actions.ts`

---

## 10. Events (EVT)

### EVT-01: Wedding Events

**User Story:** Sebagai pasangan, saya ingin mengelola acara pernikahan.

**Acceptance Criteria:**
- [x] CRUD events (Akad, Resepsi, dll)
- [x] Event date, location, notes
- [x] Link ke rundown

**Implementation:**
- File: `features/events/actions/event-actions.ts`
- Schema: `events`
- UI: `app/(app)/events/page.tsx`

---

## 11. Subscription (SUB)

### SUB-01: Subscription Plans

**User Story:** Sebagai pasangan, saya ingin melihat paket langganan.

**Acceptance Criteria:**
- [x] Display plans: Gratis, Premium, Enterprise
- [x] Feature comparison
- [x] Pricing display

**Implementation:**
- File: `features/subscription/components/subscription-checkout.tsx`
- Schema: `subscription_plans`
- UI: `app/(app)/subscription/page.tsx`

---

### SUB-03: Subscription Checkout

**User Story:** Sebagai pasangan, saya ingin upgrade ke Premium.

**Acceptance Criteria:**
- [x] Select plan
- [x] Midtrans Snap payment popup
- [x] Payment processing
- [x] Update subscription status

**Implementation:**
- File: `features/subscription/actions/subscription-actions.ts`
- API: `app/api/v1/subscription/checkout/route.ts`
- Webhook: `app/api/v1/payment/webhook/route.ts`
- UI: `features/subscription/components/subscription-checkout.tsx`

---

### SUB-02: Free Trial

**User Story:** Sebagai pengguna baru, saya ingin mencoba fitur Premium gratis.

**Acceptance Criteria:**
- [x] 14 hari trial period
- [x] Auto-activate trial on signup
- [x] Trial expiry tracking
- [x] Banner reminder sebelum trial habis

**Implementation:**
- File: `features/subscription/actions/free-trial-actions.ts`
- Schema: `subscriptions.isTrial`, `subscriptions.trialEndsAt`
- UI: `features/subscription/components/free-trial-banner.tsx`

---

### SUB-09: Invoice Generation

**User Story:** Sebagai pasangan, saya ingin mendapatkan invoice pembayaran.

**Acceptance Criteria:**
- [x] Auto-generate invoice setelah pembayaran
- [x] Invoice record di database
- [x] View invoice history

**Implementation:**
- File: `features/subscription/actions/subscription-actions.ts`
- Schema: `invoices`

---

### SUB-10: Subscription History

**User Story:** Sebagai pasangan, saya ingin melihat riwayat langganan.

**Acceptance Criteria:**
- [x] List all subscriptions
- [x] Status display (Aktif, Terlambat, Kadaluarsa, Dibatalkan)
- [x] Payment transaction history

**Implementation:**
- File: `features/subscription/queries/subscription-history-queries.ts`
- UI: `app/(app)/subscription/history/page.tsx`

---

## 12. Notifications (COL)

### COL-01: Notification Center

**User Story:** Sebagai pengguna, saya ingin melihat notifikasi.

**Acceptance Criteria:**
- [x] Notification panel
- [x] Read/unread status
- [x] Notification types: TASK_REMINDER, DUE_DATE, BUDGET_ALERT, INVITATION, SYSTEM

**Implementation:**
- File: `features/notifications/actions/notification-actions.ts`
- Schema: `notifications`
- UI: Notification panel di header

---

### COL-06: Email Notification

**User Story:** Sebagai pengguna, saya ingin mendapat notifikasi via email.

**Acceptance Criteria:**
- [x] Task reminder email
- [x] Budget alert email
- [x] Event reminder email
- [x] HTML templates dengan brand styling

**Implementation:**
- File: `lib/email.ts`, `lib/email-templates.ts`
- Service: Resend API
- Scheduler: `notification-scheduler.ts`

---

### COL-07: Push Notification

**User Story:** Sebagai pengguna, saya ingin mendapat push notification.

**Acceptance Criteria:**
- [x] Subscribe to push notifications
- [x] Unsubscribe
- [x] Send push notifications
- [x] Settings toggle

**Implementation:**
- File: `features/notifications/actions/push-notification-actions.ts`
- Schema: `push_notification_subscriptions`
- UI: `features/notifications/components/push-notification-settings.tsx`

---

### COL-08: WhatsApp Notification

**User Story:** Sebagai pengguna, saya ingin mendapat notifikasi via WhatsApp.

**Acceptance Criteria:**
- [x] Enable/disable WhatsApp notifications
- [x] Task reminder via WhatsApp
- [x] Budget alert via WhatsApp
- [x] Event reminder via WhatsApp
- [x] Phone number settings

**Implementation:**
- File: `features/notifications/actions/whatsapp-notification-actions.ts`
- Schema: `whatsapp_notifications`
- UI: `features/notifications/components/whatsapp-notification-settings.tsx`

---

## 13. Comments (COL-03)

### COL-03: Comments System

**User Story:** Sebagai anggota workspace, saya ingin berkomentar di task, event, dokumen, dan vendor.

**Acceptance Criteria:**
- [x] Add comment
- [x] Reply to comment
- [x] Delete comment
- [x] Comment on: tasks, events, documents, vendors

**Implementation:**
- File: `features/comments/actions/comment-actions.ts`
- Schema: `comments` dengan reply support
- UI: `features/comments/components/comments-section.tsx`

---

## 14. Admin Portal (ADM)

### ADM-01: Admin Dashboard

**User Story:** Sebagai admin, saya ingin melihat statistik platform.

**Acceptance Criteria:**
- [x] Total users
- [x] Total workspaces
- [x] Active subscriptions
- [x] Revenue overview
- [x] Recent activity

**Implementation:**
- File: `features/admin/actions/admin-actions.ts`
- UI: `app/admin/dashboard/page.tsx`

---

### ADM-02: User Management

**User Story:** Sebagai admin, saya ingin mengelola users.

**Acceptance Criteria:**
- [x] List all users
- [x] Search users
- [x] Set/unset admin role
- [x] Pagination

**Implementation:**
- File: `features/admin/actions/admin-actions.ts`
- UI: `app/admin/users/page.tsx`

---

### ADM-03: Workspace Management

**User Story:** Sebagai admin, saya ingin monitor semua workspace.

**Acceptance Criteria:**
- [x] List all workspaces
- [x] View workspace details
- [x] Search workspaces

**Implementation:**
- File: `features/admin/actions/admin-actions.ts`
- UI: `app/admin/workspaces/page.tsx`

---

### ADM-04: Plan Management

**User Story:** Sebagai admin, saya ingin mengelola subscription plans.

**Acceptance Criteria:**
- [x] CRUD subscription plans
- [x] Set pricing dan features
- [x] Activate/deactivate plans

**Implementation:**
- File: `features/admin/actions/admin-actions.ts`
- UI: `app/admin/plans/page.tsx`

---

### ADM-05: Payment Monitoring

**User Story:** Sebagai admin, saya ingin monitor transaksi pembayaran.

**Acceptance Criteria:**
- [x] List all payments
- [x] Filter by status
- [x] View payment details

**Implementation:**
- File: `features/admin/actions/admin-actions.ts`
- UI: `app/admin/payments/page.tsx`

---

### ADM-06: Support Tickets

**User Story:** Sebagai admin, saya ingin mengelola tiket support.

**Acceptance Criteria:**
- [x] View all tickets
- [x] Reply to tickets
- [x] Update ticket status
- [x] Ticket messages

**Implementation:**
- File: `features/admin/actions/support-actions.ts`
- Schema: `support_tickets`, `support_ticket_messages`
- UI: `app/admin/support/page.tsx`

---

### ADM-07: Content Management

**User Story:** Sebagai admin, saya ingin mengelola konten marketing.

**Acceptance Criteria:**
- [x] CRUD content (LANDING_PAGE, FAQ, BLOG, TESTIMONIAL, PARTNER)
- [x] Content types
- [x] Publish/unpublish

**Implementation:**
- File: `features/admin/actions/content-actions.ts`
- Schema: `admin_contents`
- UI: `app/admin/content/page.tsx`

---

### ADM-08: System Logs

**User Story:** Sebagai admin, saya ingin melihat audit log.

**Acceptance Criteria:**
- [x] View activity logs
- [x] Filter by type
- [x] Search logs

**Implementation:**
- File: `features/admin/actions/admin-actions.ts`
- Schema: `activity_logs`
- UI: `app/admin/logs/page.tsx`

---

## 15. Calendar (CAL)

### CAL-06: Calendar Sync

**User Story:** Sebagai pasangan, saya ingin sync kalender pernikahan dengan Google Calendar.

**Acceptance Criteria:**
- [x] Connect Google Calendar
- [x] Sync events
- [x] Disconnect calendar
- [x] Settings toggle

**Implementation:**
- File: `features/calendar/actions/calendar-sync-actions.ts`
- Schema: `calendar_syncs`
- UI: `features/calendar/components/calendar-sync-settings.tsx`

---

## 16. Settings (SET)

### SET-01: Account Settings

**User Story:** Sebagai pengguna, saya ingin mengelola pengaturan akun.

**Acceptance Criteria:**
- [x] View profile info
- [x] Sign out
- [x] Deactivate account (dengan konfirmasi)
- [x] Push notification settings
- [x] WhatsApp notification settings
- [x] Calendar sync settings

**Implementation:**
- File: `app/(app)/settings/page.tsx`
- Components: Push, WhatsApp, Calendar sync settings

---

## Summary

### Feature Completion Status

| Kategori | Total Fitur | Selesai | Progress |
|----------|:-----------:|:-------:|:--------:|
| Auth (AUTH) | 6 | 6 | 100% ✅ |
| Workspace (WKS) | 6 | 6 | 100% ✅ |
| Dashboard (DSH) | 1 | 1 | 100% ✅ |
| Tasks (TSK) | 8 | 8 | 100% ✅ |
| Budget (BGT) | 7 | 7 | 100% ✅ |
| Vendors (VND) | 7 | 7 | 100% ✅ |
| Guests (GST) | 5 | 5 | 100% ✅ |
| Documents (DOC) | 4 | 4 | 100% ✅ |
| Cultural | 4 | 4 | 100% ✅ |
| Events (EVT) | 1 | 1 | 100% ✅ |
| Subscription (SUB) | 5 | 5 | 100% ✅ |
| Notifications (COL) | 4 | 4 | 100% ✅ |
| Comments (COL) | 1 | 1 | 100% ✅ |
| Admin (ADM) | 8 | 8 | 100% ✅ |
| Calendar (CAL) | 1 | 1 | 100% ✅ |
| Settings (SET) | 1 | 1 | 100% ✅ |
| **Total** | **69** | **69** | **100%** ✅ |

### Infrastructure

| Komponen | Status |
|----------|--------|
| Database (28+ tabel) | ✅ Selesai |
| Migrations (34 files) | ✅ Selesai |
| RLS Policies | ✅ Selesai |
| Cloud Storage (Vercel Blob) | ✅ Kode siap, perlu token |
| Email (Resend) | ✅ Kode siap, perlu domain verification |
| Payment (Midtrans) | ✅ Sandbox configured |
| Cron Jobs | ✅ Kode siap, aktif di Vercel |
| Testing (5 tests) | ✅ Pass |
| Documentation | ✅ Selesai |
