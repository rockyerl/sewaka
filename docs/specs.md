# Technical Specifications — Sewaka

Dokumen ini berisi spesifikasi teknis lengkap aplikasi Sewaka — platform
perencanaan pernikahan untuk adat Nusantara.

---

## 1. Technology Stack

### Frontend

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js App Router | 16.4.5 |
| UI Library | React | 19.3.0 |
| CSS Framework | Tailwind CSS | v4.3.4 |
| Component Library | shadcn/ui (Radix UI) | 1.8.1 |
| Icons | Lucide React | 1.68.0 |
| Charts | Recharts | 3.10.1 |
| Forms | React Hook Form | 7.91.0 |
| Toast Notifications | Sonner | 2.0.8 |
| Theme | next-themes | 0.4.6 |
| Date Formatting | date-fns | 4.4.0 |
| QR Code | qrcode | 1.5.4 |

### Backend

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Runtime | Node.js | 20+ |
| Server | Next.js Server | built-in |
| ORM | Drizzle ORM | 0.45.4 |
| Migration Tool | Drizzle Kit | 0.31.11 |
| Validation | Zod | 4.6.7 |
| Authentication | Auth.js (NextAuth) | 5.0.0-beta.32 |
| Password Hashing | bcryptjs | 3.0.3 |

### Database

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| RDBMS | PostgreSQL | 16+ |
| Connection Pool | pg | 8.23.1 |
| Row-Level Security | PostgreSQL RLS | native |
| Local Dev DB | Docker PostgreSQL | docker-compose |
| Test DB | PGlite | 0.5.15 |

### External Services

| Layanan | Provider | Penggunaan |
|---------|----------|------------|
| Cloud Storage | Vercel Blob | File upload (gallery, dokumen, kontrak) |
| Email | Resend | Verification, password reset, notifications |
| Payment Gateway | Midtrans | Subscription checkout (Snap API) |
| WhatsApp | WhatsApp Business API | Notification via WhatsApp |
| Deployment | Vercel | Hosting dan cron jobs |

### Development Tools

| Tool | Penggunaan |
|------|-----------|
| TypeScript | 5.9.3 — type safety |
| ESLint | 9.39.5 — linting |
| shadcn CLI | 4.23.0 — component generation |
| Drizzle Studio | Database GUI |
| Node.js Test Runner | Native testing |

---

## 2. Architecture Overview

### Application Structure

```
com.sewaka-web/
├── app/                    # Next.js App Router
│   ├── (app)/              # Protected routes (middleware auth)
│   ├── admin/              # Admin portal (role-based)
│   ├── api/                # API routes
│   ├── auth/               # Auth pages
│   └── invitation/         # Public invitation pages
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui primitives
├── db/                     # Database layer
│   ├── schema.ts           # Drizzle schema definitions
│   ├── index.ts            # Connection management
│   └── with-workspace.ts   # RLS context helper
├── features/               # Domain-driven feature modules
│   └── <feature>/
│       ├── actions/        # Server actions (mutations)
│       ├── components/     # Feature-specific UI
│       ├── queries/        # Server-side data fetching
│       ├── schemas/        # Zod validation schemas
│       └── index.ts        # Public API exports
├── drizzle/                # SQL migrations
├── lib/                    # Shared utilities
├── tests/                  # Test files
└── public/                 # Static assets
```

### Feature Module Pattern

Setiap fitur di `features/` mengikuti pola konsisten:

```
features/tasks/
├── actions/
│   ├── task-actions.ts     # CRUD server actions
│   ├── attachment-actions.ts # Attachment actions
│   └── index.ts            # Re-exports
├── components/
│   ├── task-row.tsx        # "use client" — interactive row
│   └── task-form.tsx       # "use client" — form component
├── queries/
│   ├── task-queries.ts     # Server-side queries
│   └── index.ts            # Re-exports
├── schemas/
│   └── task.ts             # Zod schemas
└── index.ts                # Public API
```

### Server Action Pattern

Semua mutations menggunakan Next.js Server Actions:

```typescript
// features/tasks/actions/task-actions.ts
"use server";

export async function createTaskAction(formData: FormData) {
  const session = await auth();
  // 1. Auth check
  // 2. Parse & validate input
  // 3. Database operation with workspace context
  // 4. Revalidate paths
  // 5. Return result or throw error
}
```

### Data Fetching Pattern

Server components fetch data langsung:

```typescript
// app/(app)/tasks/page.tsx
export default async function TasksPage() {
  const tasks = await getTasksAction(workspaceId);
  return <TaskListView tasks={tasks} />;
}
```

Client components menerima data sebagai props dan memanggil server actions untuk mutations.

---

## 3. Database Schema

### Overview

- **Total tabel:** 28+
- **Migrations:** 16 files (0000–0015)
- **ORM:** Drizzle ORM dengan PostgreSQL
- **Security:** Row-Level Security (RLS) pada semua tabel workspace

### Enum Types

| Enum | Values |
|------|--------|
| `workspace_role` | OWNER, PARTNER, FAMILY, COORDINATOR |
| `task_status` | TODO, IN_PROGRESS, COMPLETED |
| `task_priority` | LOW, MEDIUM, HIGH |
| `vendor_status` | SHORTLISTED, CONTACTED, BOOKED |
| `rsvp_status` | PENDING, ACCEPTED, DECLINED |
| `notification_type` | TASK_REMINDER, DUE_DATE, BUDGET_ALERT, INVITATION, SYSTEM |
| `notification_read` | UNREAD, READ |
| `subscription_status` | ACTIVE, PAST_DUE, EXPIRED, CANCELLED, REFUNDED |
| `payment_status` | PENDING, COMPLETED, FAILED, REFUNDED |
| `quotation_status` | PENDING, ACCEPTED, REJECTED |

### Table Categories

#### Authentication (4 tabel)
- `users` — user profiles dengan role (admin/user)
- `accounts` — OAuth accounts (Google)
- `sessions` — active sessions
- `verification_tokens` — email verification & password reset tokens

#### Workspace (3 tabel)
- `workspaces` — wedding workspace (couple names, date, location, slug)
- `workspace_members` — member assignments dengan role
- `wedding_concepts` — tema, warna, deskripsi konsep

#### Tasks (5 tabel)
- `tasks` — tasks dengan notes, status, priority, assignment
- `task_categories` — kategori tasks
- `task_templates` — template tasks dengan offset days
- `task_attachments` — file attachments per task
- `recurring_tasks` — recurring task definitions

#### Budget (4 tabel)
- `budgets` — total budget per workspace
- `budget_categories` — allocated amount per category
- `expenses` — actual expenses
- `expense_attachments` — file attachments per expense

#### Vendors (5 tabel)
- `vendors` — vendor database
- `quotations` — vendor quotations
- `vendor_payments` — DP dan final payment tracking
- `vendor_portfolio_images` — portfolio gallery
- `vendor_contracts` — contract documents

#### Guests (2 tabel)
- `guests` — guest database dengan RSVP, QR code, check-in
- `guest_categories` — guest categories

#### Documents (3 tabel)
- `documents` — uploaded documents
- `document_shares` — share links dengan expiry
- `image_gallery` — image gallery

#### Cultural (3 tabel)
- `seserahan_items` — seserahan dan mahar items
- `cultural_rundowns` — rundown acara adat
- `encyclopedia_entries` — ensiklopedia budaya

#### Events (1 tabel)
- `events` — wedding events (Akad, Resepsi, dll)

#### Invitation Customization (1 tabel)
- `invitation_customization` — custom settings per workspace untuk undangan digital
  - `couple_photo_url` — foto utama mempelai di hero section
  - `theme` — tema warna (emas, burgundy, sage, rose, navy)
  - `music_url` — URL musik latar (direct audio file)
  - `story` — cerita cinta plain text (fallback)
  - `story_timeline` — JSONB array timeline visual `{date, title, description, photo_url}`
  - `gallery_image_ids` — array blob IDs galeri foto
  - `gift_accounts` — JSONB array akun kado digital `{type, name, number, accountName}`
  - `video_url` — URL YouTube video kenangan
  - `live_stream_url` — URL live streaming eksternal
  - `custom_font` — Google Fonts untuk nama mempelai (Playfair Display, Great Vibes, dll)
  - `background_image_url` — URL gambar background custom
  - `hero_photo_urls` — JSONB array blob URLs untuk carousel hero
  - `enable_animations` — toggle animasi floating hearts/confetti

#### Subscription (4 tabel)
- `subscription_plans` — plan definitions
- `subscriptions` — user subscriptions dengan trial
- `payment_transactions` — payment records
- `invoices` — generated invoices

#### Notifications (3 tabel)
- `notifications` — notification center
- `push_notification_subscriptions` — push notification settings
- `whatsapp_notifications` — WhatsApp notification settings

#### Comments (1 tabel)
- `comments` — comments dengan reply support

#### Admin (3 tabel)
- `support_tickets` — support ticket system
- `support_ticket_messages` — ticket messages
- `admin_contents` — CMS content

#### Calendar (1 tabel)
- `calendar_syncs` — external calendar sync settings

#### Audit (1 tabel)
- `activity_logs` — activity logging

### Row-Level Security

Semua tabel workspace menggunakan PostgreSQL RLS:

```sql
-- Policy pattern
CREATE POLICY workspace_member_read ON tasks
  FOR SELECT TO sewaka_app
  USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND has_workspace_role(
      workspace_id,
      nullif(current_setting('app.user_id', true), '')::uuid,
      NULL
    )
  );
```

Context RLS diatur transaction-locally via `withWorkspace()`:

```typescript
const db = await withWorkspace(workspaceId, userId, async (db) => {
  return db.select().from(tasks).where(eq(tasks.workspaceId, workspaceId));
});
```

---

## 4. Authentication & Authorization

### Auth Providers

| Provider | Status | Konfigurasi |
|----------|--------|-------------|
| Google OAuth | ✅ Aktif | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Email/Password | ✅ Aktif | bcryptjs hashing |
| Email Verification | ✅ Aktif | Resend API |
| Forgot Password | ✅ Aktif | Token-based reset |

### Authorization Model

#### Workspace Roles

| Role | Permissions |
|------|-------------|
| OWNER | Full access, manage members, delete workspace |
| PARTNER | Full access, manage members |
| COORDINATOR | Create/edit tasks, budget, vendors, guests |
| FAMILY | Read-only access |

#### Admin Role

| Role | Permissions |
|------|-------------|
| admin | Access `/admin/*`, manage users, monitor platform |
| user | No admin access |

Role admin diset via database: `UPDATE users SET role = 'admin' WHERE id = '...'`

### Session Management

- Auth.js v5 dengan Drizzle adapter
- Session stored in `sessions` table
- `auth()` helper untuk check session di server actions

---

## 5. API Routes

### Auth Routes (Auth.js)

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/auth/signin` | GET | Sign-in page |
| `/api/auth/callback/google` | GET | Google OAuth callback |
| `/api/auth/session` | GET | Current session |
| `/api/auth/signout` | POST | Sign out |

### API v1 Routes

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/v1/health` | GET | Health check endpoint |
| `/api/v1/workspaces/onboarding` | POST | Onboarding wizard |
| `/api/v1/subscription/checkout` | POST | Midtrans checkout |
| `/api/v1/payment/webhook` | POST | Midtrans webhook |
| `/api/v1/vendors/comparison` | GET | Vendor comparison |
| `/api/v1/guests/check-in` | POST | Guest check-in via QR |
| `/api/v1/blob` | GET | Blob URL proxy for invitation images |

### Server Actions (Invitation)

| Action | File | Deskripsi |
|--------|------|-----------|
| `updateInvitationCustom` | `features/invitation-custom/actions/invitation-custom-actions.ts` | Simpan semua pengaturan undangan (foto, tema, musik, story, timeline, dll) |
| `uploadCouplePhotoAction` | `features/invitation-custom/actions/invitation-custom-actions.ts` | Upload foto couple/hero ke Vercel Blob |
| `bulkWaInviteAction` | `features/guests/actions/bulk-invite-actions.ts` | Generate link WhatsApp massal (max 50/batch) |

### Cron Routes

| Route | Schedule | Deskripsi |
|-------|----------|-----------|
| `/api/cron/notifications` | Every hour | Task reminders, budget alerts, event reminders |

---

## 6. File Storage

### Vercel Blob Integration

File upload menggunakan Vercel Blob dengan fallback ke placeholder URL jika token tidak tersedia.

```typescript
// lib/storage.ts
import { uploadFile, deleteFile } from "@/lib/storage";

const result = await uploadFile(file, {
  pathname: `gallery/${workspaceId}/${filename}`,
  accessType: "public",
});
```

### Upload Limits

| Tipe File | Max Size |
|-----------|----------|
| Image (Gallery) | 10MB |
| Document | 50MB |
| Contract | 20MB |
| Task Attachment | 10MB |
| Expense Attachment | 10MB |
| Vendor Portfolio | 10MB |

### Storage Paths

```
blob://
├── gallery/<workspaceId>/<filename>
├── documents/<workspaceId>/<filename>
├── contracts/<workspaceId>/<filename>
├── portfolio/<vendorId>/<filename>
├── attachments/<taskId>/<filename>
├── expenses/<expenseId>/<filename>
├── couple-photo/<workspaceId>/<filename>    # Hero couple photo
└── hero-photo/<workspaceId>/<filename>     # Hero carousel photos
```

---

## 7. Email System

### Resend Integration

Email dikirim via Resend API dengan HTML templates.

```typescript
// lib/email.ts
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: user.email,
  subject: "Verifikasi Email",
  html: verificationEmailTemplate(code),
});
```

### Email Templates

| Template | Penggunaan |
|----------|-----------|
| Verification Code | Email verification (AUTH-04) |
| Password Reset | Forgot password (AUTH-05) |
| Task Reminder | Task due soon notification |
| Budget Alert | Budget 80%+ used alert |
| Event Reminder | Event upcoming notification |

### Configuration

- `RESEND_API_KEY` — API key Resend
- `MAIL_FROM` — Email pengirim (default: `onboarding@resend.dev`)
- Domain `sewaka.com` perlu diverifikasi di Resend dashboard untuk production

---

## 8. Payment Integration

### Midtrans Snap

Payment gateway untuk subscription checkout.

```typescript
// features/subscription/actions/subscription-actions.ts
const result = await createSubscriptionCheckout(workspaceId, planId);
// Returns Midtrans Snap redirect URL or token
```

### Configuration

- `MIDTRANS_SERVER_KEY` — Server key untuk API
- `MIDTRANS_CLIENT_KEY` — Client key untuk Snap
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — Client-side key

### Webhook

Endpoint `/api/v1/payment/webhook` menerima callback dari Midtrans:
- Update subscription status
- Record payment transaction
- Generate invoice

### Sandbox Testing

| Card Number | Result |
|-------------|--------|
| 4811 1111 1111 1114 | Success |
| 4811 1111 1111 1115 | Challenge (3DS) |
| 4811 1111 1111 1117 | Failure |

---

## 9. Notification System

### Notification Types

| Type | Trigger | Channel |
|------|---------|---------|
| TASK_REMINDER | Task due in 24h | Email, Push, WhatsApp |
| DUE_DATE | Task overdue | Email, Push, WhatsApp |
| BUDGET_ALERT | Budget 80%+ used | Email, Push, WhatsApp |
| INVITATION | New workspace invite | Email |
| SYSTEM | System announcements | In-app, Push |

### Scheduler

Cron job berjalan setiap jam via Vercel Cron:
- Check tasks due in 24h → send reminders
- Check budget usage → send alerts if 80%+
- Check events in 48h → send reminders

### Channels

| Channel | Status | Konfigurasi |
|---------|--------|-------------|
| In-App | ✅ Aktif | `notifications` table |
| Email | ✅ Aktif | Resend API |
| Push Notification | ✅ Aktif | Web Push API |
| WhatsApp | ⚠️ Perlu API key | WhatsApp Business API |

---

## 10. Testing

### Test Suite

| Test File | Coverage |
|-----------|----------|
| `tests/rls.test.mjs` | RLS isolation dengan PGlite |
| `tests/auth.test.mjs` | Authentication flows |
| `tests/curated-and-seserahan.test.mjs` | Cultural features |
| `tests/features.test.mjs` | Notification scheduler, user role, guest check-in |

### Running Tests

```powershell
npm test              # All tests
npm run test:security # RLS tests only
npm run test:auth     # Auth tests only
```

---

## 11. Deployment

### Vercel Configuration

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Environment Variables

| Variable | Required | Production Value |
|----------|----------|------------------|
| `AUTH_SECRET` | ✅ | Random 32+ chars |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth ID |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth secret |
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `MIGRATION_DATABASE_URL` | ✅ | Migration connection |
| `RESEND_API_KEY` | ⚠️ | Resend API key |
| `MAIL_FROM` | ❌ | `noreply@sewaka.com` (verified domain) |
| `MIDTRANS_SERVER_KEY` | ⚠️ | Midtrans server key |
| `MIDTRANS_CLIENT_KEY` | ⚠️ | Midtrans client key |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | ⚠️ | Midtrans client key |
| `BLOB_READ_WRITE_TOKEN` | ⚠️ | Vercel Blob token |
| `WHATSAPP_API_KEY` | ❌ | WhatsApp API key |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ❌ | VAPID public key |
| `CRON_SECRET` | ❌ | Random secret |

### Database Migration

```powershell
# Production migration
npm run db:migrate
```

Pastikan `MIGRATION_DATABASE_URL` menggunakan role dengan hak `SET ROLE sewaka_rls`.

---

## 12. Performance Considerations

### Current Status

- **Build:** 46+ halaman, 0 error
- **Server Components:** Default untuk semua pages
- **Client Components:** Hanya untuk interactive UI
- **Caching:** Next.js cache dengan `export const instant = false` untuk dynamic routes

### Optimization Opportunities

1. **Image Optimization** — Next.js Image component untuk gallery dan portfolio
2. **React Query** — Client-side caching untuk data fetching
3. **Code Splitting** — Dynamic imports untuk heavy components
4. **Database Indexes** — Index pada kolom yang sering di-query
5. **CDN** — Vercel Edge Network untuk static assets

---

## 13. Security

### Implemented

- ✅ PostgreSQL Row-Level Security
- ✅ Role-Based Access Control (workspace + admin)
- ✅ Auth.js session management
- ✅ Server Actions dengan auth check
- ✅ Zod input validation
- ✅ bcryptjs password hashing
- ✅ Cron job secret protection
- ✅ CSRF protection (Next.js built-in)

### Recommendations

- [ ] Rate limiting untuk API routes (login, registration)
- [ ] Content Security Policy headers
- [ ] HSTS headers
- [ ] Error tracking (Sentry)
- [ ] Security audit

---

## 14. Monitoring & Observability

### Current

- ✅ Health check endpoint (`/api/v1/health`)
- ✅ Activity logging (`activity_logs` table)
- ✅ Admin dashboard untuk monitoring

### Recommended

- [ ] Error tracking (Sentry)
- [ ] Usage analytics (Vercel Analytics / Plausible)
- [ ] Performance monitoring (RUM)
- [ ] Structured logging
- [ ] Alerting untuk critical errors

---

## 15. Development Workflow

### Schema Changes

1. Edit `db/schema.ts`
2. Run `npm run db:generate`
3. Review SQL di `drizzle/`
4. Commit migration files
5. Apply dengan `npm run db:migrate`

### Feature Development

1. Buat folder di `features/<feature>/`
2. Tambahkan schema di `db/schema.ts` jika perlu
3. Buat server actions di `actions/`
4. Buat queries di `queries/`
5. Buat components di `components/`
6. Tambahkan route di `app/`
7. Export di `index.ts`
8. Update sidebar jika perlu

### Code Style

- TypeScript strict mode
- ESLint dengan Next.js config
- Tailwind CSS untuk styling
- shadcn/ui untuk components
- Server Actions untuk mutations
- Zod untuk validation
