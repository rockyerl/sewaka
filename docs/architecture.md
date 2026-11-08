# Architecture Documentation — Sewaka

Dokumen ini menjelaskan arsitektur aplikasi Sewaka secara mendalam — dari
high-level design hingga data flow, component hierarchy, dan design decisions.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Server     │  │  Client     │  │  Static Assets (CDN)    │ │
│  │  Components │  │  Components │  │  (Images, Fonts, etc)   │ │
│  │  (Pages)    │  │  (Forms,    │  │                         │ │
│  │             │◄─┤   Interactive)│  │                         │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘ │
│         │                 │                                      │
│         │  Server Actions │  API Routes                          │
└─────────┼─────────────────┼──────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js Server (Vercel Edge)                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Server     │  │  API Routes │  │  Middleware (Auth.js)   │ │
│  │  Actions    │  │  (REST)     │  │                         │ │
│  │  (Mutations)│  │             │  │  - Session check        │ │
│  │             │  │  - Auth     │  │  - Admin role check     │ │
│  │  - Auth     │  │  - Payment  │  │  - Rate limiting (TODO) │ │
│  │  - Validate │  │  - Webhook  │  │                         │ │
│  │  - DB Ops   │  │  - Cron     │  │                         │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘ │
│         │                 │                                      │
│         ▼                 ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Shared Layer                                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │    │
│  │  │ Drizzle  │  │ Auth.js  │  │ Zod Validation       │  │    │
│  │  │ ORM      │  │ Session  │  │ Schemas              │  │    │
│  │  └────┬─────┘  └──────────┘  └──────────────────────┘  │    │
│  └───────┼──────────────────────────────────────────────────┘    │
│          │                                                        │
└──────────┼────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Row-Level  │  │  Workspace  │  │  Application Role       │ │
│  │  Security   │  │  Isolation  │  │  (sewaka_app)           │ │
│  │  (RLS)      │  │  (Context)  │  │                         │ │
│  │             │  │             │  │  - No superuser         │ │
│  │  Policies:  │  │             │  │  - No BYPASSRLS         │ │
│  │  - Read    │  │             │  │  - Limited to workspace  │ │
│  │  - Write   │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
│  28+ Tables: users, workspaces, tasks, budget, vendors,         │
│  guests, documents, gallery, cultural, subscription,            │
│  invitation_customization, etc.                                 │
└─────────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Vercel     │  │    Resend    │  │   Midtrans   │  │   WhatsApp   │
│    Blob      │  │     API      │  │    Snap      │  │    Business  │
│  (Storage)   │  │   (Email)    │  │  (Payment)   │  │   (Notify)   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 2. Application Layers

### Layer 1: Presentation Layer (UI)

**Location:** `app/`, `components/`, `features/*/components/`

**Responsibility:** Render UI dan handle user interaction.

**Pattern:**
- **Server Components** (default) — render di server, kirim HTML ke client
- **Client Components** (`"use client"`) — interaktif, state management, event handlers

```typescript
// Server Component — page.tsx
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component — component.tsx
"use client";

export function ClientComponent({ data }) {
  const [state, setState] = useState();
  const handleClick = () => serverAction();
  return <button onClick={handleClick}>...</button>;
}
```

**Rules:**
- Default ke Server Component
- Gunakan Client Component hanya saat perlu interaktivitas
- Server Actions bisa dipanggil dari Client Component

### Layer 2: Business Logic Layer (Server Actions)

**Location:** `features/*/actions/`

**Responsibility:** Handle mutations, business rules, dan data validation.

**Pattern:**

```typescript
// features/tasks/actions/task-actions.ts
"use server";

export async function createTaskAction(formData: FormData) {
  // 1. Authentication
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 2. Parse input
  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;

  // 3. Validation
  const result = createTaskSchema.safeParse({ workspaceId, title });
  if (!result.success) throw new Error("Invalid input");

  // 4. Authorization (workspace role check)
  const member = await getWorkspaceMember(workspaceId, session.user.id);
  if (!member || member.role === "FAMILY") throw new Error("Forbidden");

  // 5. Database operation
  const db = await withWorkspace(workspaceId, session.user.id, async (db) => {
    const [task] = await db
      .insert(tasks)
      .values({ workspaceId, title, createdBy: session.user.id })
      .returning();
    return task;
  });

  // 6. Side effects
  await logActivity(session.user.id, workspaceId, "TASK_CREATED", { taskId: task.id });
  revalidatePath(`/tasks`);

  // 7. Return result
  return task;
}
```

**Rules:**
- Selalu check auth di awal
- Validate input dengan Zod
- Check workspace role sebelum write
- Gunakan `withWorkspace` untuk RLS context
- Revalidate paths setelah mutation
- Log activity untuk audit trail

### Layer 3: Data Access Layer (Queries)

**Location:** `features/*/queries/`

**Responsibility:** Fetch data dari database dengan proper workspace isolation.

**Pattern:**

```typescript
// features/tasks/queries/task-queries.ts
import "server-only";

export async function getTasksAction(workspaceId: string) {
  const db = await getDb();
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId))
    .orderBy(desc(tasks.createdAt));
}
```

**Rules:**
- Gunakan `"use server"` atau `import "server-only"`
- Selalu filter by `workspaceId`
- Gunakan parameterized queries (Drizzle ORM)
- Jangan expose raw SQL

### Layer 4: Database Layer

**Location:** `db/`

**Responsibility:** Database connection, schema definitions, dan RLS management.

**Components:**

```typescript
// db/index.ts — Connection management
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || "20"),
});

export function getDb() {
  return drizzle(pool);
}

// db/with-workspace.ts — RLS context
export async function withWorkspace<T>(
  workspaceId: string,
  userId: string,
  fn: (db: Database) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("SET LOCAL app.workspace_id TO $1", [workspaceId]);
    await client.query("SET LOCAL app.user_id TO $1", [userId]);
    const db = drizzle(client);
    return await fn(db);
  } finally {
    client.release();
  }
}
```

**Rules:**
- Gunakan connection pooling
- Set RLS context transaction-locally
- Always release connections
- Use `sewaka_app` role (not superuser)

### Layer 5: Infrastructure Layer

**Location:** `lib/`

**Responsibility:** Shared utilities untuk external services.

**Components:**

| File | Purpose |
|------|---------|
| `lib/storage.ts` | Vercel Blob upload/delete |
| `lib/email.ts` | Resend email sending |
| `lib/email-templates.ts` | HTML email templates |
| `lib/env.ts` | Environment validation |

---

## 3. Data Flow

### Read Flow (Server Component)

```
User requests /tasks
    │
    ▼
Next.js routes to app/(app)/tasks/page.tsx (Server Component)
    │
    ▼
Page calls getTasksAction(workspaceId)
    │
    ▼
Query function uses Drizzle ORM to fetch from DB
    │
    ▼
PostgreSQL executes query with RLS policies
    │
    ▼
Data returned to page
    │
    ▼
Page renders Server Component with data
    │
    ▼
HTML sent to client
```

### Write Flow (Server Action)

```
User clicks "Create Task"
    │
    ▼
Client Component calls createTaskAction(formData)
    │
    ▼
Server Action executes on server
    │
    ▼
1. Auth check: auth() → session
2. Input validation: Zod schema
3. Role check: getWorkspaceMember()
4. DB operation: withWorkspace() → Drizzle insert
5. Side effects: logActivity(), revalidatePath()
    │
    ▼
Result returned to client
    │
    ▼
Client updates UI (optimistic update or re-render)
```

### External Service Flow (Payment)

```
User clicks "Upgrade to Premium"
    │
    ▼
Client calls createSubscriptionCheckout()
    │
    ▼
Server Action creates Midtrans transaction
    │
    ▼
Midtrans returns Snap token/redirect URL
    │
    ▼
Client opens Midtrans Snap popup
    │
    ▼
User completes payment
    │
    ▼
Midtrans sends webhook to /api/v1/payment/webhook
    │
    ▼
Webhook handler:
1. Verify signature
2. Update subscription status
3. Record payment transaction
4. Generate invoice
    │
    ▼
User sees updated subscription status
```

---

## 4. Component Hierarchy

### App Layout

```
RootLayout (app/layout.tsx)
├── Providers (theme, auth, toast)
└── Children

┌─ Auth Pages (app/auth/)
│  ├── SignInPage
│  ├── SignUpPage
│  ├── ForgotPasswordPage
│  └── ResetPasswordPage
│
├─ Public Pages (app/)
│  ├── HomePage (app/page.tsx)
│  └── InvitationPage (app/invitation/[slug]/)
│      ├── InvitationCover — "Buka Undangan" full-screen cover
│      ├── HeroCarousel — multiple hero photos with auto-slide
│      ├── StoryTimeline — visual timeline with milestones
│      ├── EventCountdown — real-time countdown per event
│      ├── LoveAnimation — floating hearts on scroll (toggleable)
│      ├── GiftAccountsSection — cashless gift with copy button
│      ├── VideoSection — YouTube embed
│      ├── LiveStreamSection — external stream link
│      └── WhatsAppShare — personalized share button
│
├─ Protected Layout (app/(app)/layout.tsx)
│  ├── AppSidebar (16 menu items)
│  ├── Header (user menu, notifications)
│  └── Children
│
│  ┌─ Dashboard (app/(app)/dashboard/)
│  │  ├── WeddingCountdown
│  │  ├── QuickActions
│  │  ├── BudgetOverview
│  │  ├── UpcomingTasks
│  │  ├── UpcomingEvents
│  │  ├── GuestRSVP
│  │  └── VendorOverview
│  │
│  ┌─ Tasks (app/(app)/tasks/)
│  │  ├── TaskListView
│  │  ├── TaskRow (client)
│  │  └── TaskForm (client)
│  │
│  ┌─ Budget (app/(app)/budget/)
│  │  ├── BudgetPage
│  │  ├── ExpenseForm (client)
│  │  └── FinancialReport (app/(app)/budget/financial/)
│  │
│  ┌─ Vendors (app/(app)/vendors/)
│  │  ├── VendorListView
│  │  ├── VendorDetail (app/(app)/vendors/[id]/)
│  │  ├── QuotationForm (client)
│  │  └── VendorComparison (client)
│  │
│  ┌─ Guests (app/(app)/guests/)
│  │  ├── GuestListView
│  │  ├── GuestForm (client)
│  │  ├── QRCodeGenerator (client)
│  │  ├── BulkInviteDialog (client) — mass WA invite (max 50/batch)
│  │  └── AttendanceReport (app/(app)/guests/attendance/)
│  │
│  ┌─ Invitation Custom (app/(app)/invitation/custom/)
│  │  ├── InvitationCustomPage (client)
│  │  │   ├── Couple Photo Upload
│  │  │   ├── Theme Picker (5 themes)
│  │  │   ├── Music URL Input
│  │  │   ├── Story Textarea
│  │  │   ├── Story Timeline CRUD (milestones)
│  │  │   ├── Hero Photo Carousel Upload
│  │  │   ├── Gallery Image Picker
│  │  │   ├── Gift Accounts CRUD (bank/e-wallet)
│  │  │   ├── Video URL Input (YouTube)
│  │  │   ├── Live Stream URL Input
│  │  │   ├── Custom Font Picker (Google Fonts)
│  │  │   ├── Background Image URL
│  │  │   └── Animations Toggle
│  │  └── Server Actions: updateInvitationCustom, uploadCouplePhoto
│  ┌─ Documents (app/(app)/documents/)
│  │  ├── DocumentList
│  │  └── DocumentUploadForm (client)
│  │
│  ┌─ Gallery (app/(app)/gallery/)
│  │  ├── GalleryGrid
│  │  └── ImageUploadForm (client)
│  │
│  ┌─ Contracts (app/(app)/contracts/)
│  │  ├── ContractList
│  │  └── ContractUploadForm (client)
│  │
│  ┌─ Cultural Features
│  │  ├── Seserahan (app/(app)/seserahan/)
│  │  ├── Encyclopedia (app/(app)/encyclopedia/)
│  │  └── Rundown (app/(app)/wedding-day/)
│  │
│  ┌─ Events & Calendar
│  │  ├── Events (app/(app)/events/)
│  │  └── Timeline (app/(app)/timeline/)
│  │
│  ┌─ Subscription (app/(app)/subscription/)
│  │  ├── SubscriptionPage (client)
│  │  ├── SubscriptionCheckout (client)
│  │  └── SubscriptionHistory (app/(app)/subscription/history/)
│  │
│  └─ Settings (app/(app)/settings/)
│     ├── ProfileSettings
│     ├── PushNotificationSettings (client)
│     ├── WhatsAppNotificationSettings (client)
│     └── CalendarSyncSettings (client)
│
└─ Admin Layout (app/admin/layout.tsx)
   ├── AdminSidebar
   └── Children

   ┌─ Dashboard (app/admin/dashboard/)
   ┌─ Users (app/admin/users/)
   ┌─ Workspaces (app/admin/workspaces/)
   ┌─ Plans (app/admin/plans/)
   ┌─ Payments (app/admin/payments/)
   ┌─ Logs (app/admin/logs/)
   ┌─ Support (app/admin/support/)
   └─ Content (app/admin/content/)
```

---

## 5. Design Decisions

### Why Next.js App Router?

**Decision:** Next.js 16 dengan App Router (bukan Pages Router).

**Reasons:**
- Server Components by default — mengurangi JavaScript bundle
- Colocation — components dekat dengan route
- Streaming — partial rendering dengan Suspense
- Middleware — edge functions untuk auth check
- Built-in API routes — tidak perlu Express terpisah

**Trade-offs:**
- Learning curve untuk team yang terbiasa dengan Pages Router
- Beberapa library belum support Server Components

### Why Drizzle ORM?

**Decision:** Drizzle ORM (bukan Prisma, TypeORM, atau raw SQL).

**Reasons:**
- Type-safe queries tanpa code generation
- SQL-like syntax — mudah dibaca dan di-debug
- Lightweight — tidak ada runtime overhead besar
- Migration tool (Drizzle Kit) — generate SQL dari schema
- PostgreSQL native — mendukung RLS, JSONB, enums

**Trade-offs:**
- Komunitas lebih kecil dibanding Prisma
- Beberapa fitur advanced belum ada (N+1 detection, dll)

### Why Server Actions?

**Decision:** Next.js Server Actions untuk semua mutations (bukan REST API terpisah).

**Reasons:**
- No API route boilerplate — langsung call dari component
- Type-safe — TypeScript inference dari server ke client
- Built-in CSRF protection
- Automatic serialization
- Can be called from Server dan Client Components

**Trade-offs:**
- Tight coupling dengan Next.js
- Testing lebih kompleks dibanding REST API

### Why PostgreSQL RLS?

**Decision:** PostgreSQL Row-Level Security untuk workspace isolation.

**Reasons:**
- Database-level security — tidak bisa bypass dari application code
- Multi-tenant isolation — setiap workspace terisolasi
- Role-based policies — OWNER, PARTNER, FAMILY, COORDINATOR
- Defense in depth — aplikasi check + database check

**Trade-offs:**
- Complexity dalam setup dan debugging
- Performance overhead (minimal, ~1-2ms per query)
- Migration complexity — perlu RLS-aware migrations

### Why Vercel Blob?

**Decision:** Vercel Blob untuk file storage (bukan S3, Cloudinary, atau local).

**Reasons:**
- Seamless Vercel integration — auto-configure di deployment
- Simple API — `put()`, `del()`, `list()`
- CDN built-in — global edge caching
- Pay per use — cocok untuk startup

**Trade-offs:**
- Vendor lock-in ke Vercel ecosystem
- Limited features dibanding S3 (lifecycle policies, dll)

### Why Midtrans?

**Decision:** Midtrans Snap untuk payment gateway (bukan Stripe, Xendit, atau lainnya).

**Reasons:**
- Indonesia-focused — support local payment methods
- Snap API — ready-made payment popup
- Webhook support — reliable payment callback
- Sandbox environment — easy testing

**Trade-offs:**
- Documentation kurang lengkap dibanding Stripe
- Support response time bervariasi

### Why JSONB for Invitation Fields?

**Decision:** Gunakan PostgreSQL JSONB untuk `story_timeline`, `hero_photo_urls`, `gift_accounts` di `invitation_customization`.

**Reasons:**
- Fleksibel — tidak perlu tabel baru untuk setiap fitur
- Konsisten dengan struktur yang sudah ada (`gallery_image_ids`)
- Query efisien — PostgreSQL JSONB support indexing
- Simple CRUD — parse di application layer, simpan sebagai JSON

**Trade-offs:**
- Tidak ada foreign key constraint ke JSONB data
- Validasi harus di application layer (sanitasi input)
- Migration dari struktur JSON perlu manual update

### Why Pure CSS for Love Animation?

**Decision:** Animasi floating hearts/confetti menggunakan CSS keyframes, bukan library eksternal.

**Reasons:**
- Ringan — tidak menambah bundle size
- Performan — GPU-accelerated transforms
- Toggleable — `enable_animations` field untuk on/off
- Scroll-triggered — muncul hanya saat user scroll

**Trade-offs:**
- Limited complexity — tidak bisa animasi 3D atau particle system
- Browser compatibility — CSS animations well-supported di modern browser

---

## 6. Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │  Auth.js │     │ Database │
│  (Browser)    │  (Server)  │     │ (Postgres)│
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                 │                 │
     │  1. Login       │                 │
     │  (Google OAuth) │                 │
     │────────────────>│                 │
     │                 │                 │
     │                 │  2. Create/Find User
     │                 │────────────────>│
     │                 │                 │
     │                 │  3. Return user │
     │                 │<────────────────│
     │                 │                 │
     │  4. Set session │                 │
     │<────────────────│                 │
     │                 │                 │
     │  5. Subsequent  │                 │
     │     requests    │                 │
     │────────────────>│                 │
     │                 │                 │
     │                 │  6. Verify session
     │                 │────────────────>│
     │                 │                 │
     │  7. Return      │                 │
     │     session     │                 │
     │<────────────────│                 │
```

### Authorization Layers

```
Layer 1: Middleware (Edge)
├── Check session exists
├── Redirect to login if not authenticated
└── Block /admin/* if role != 'admin'

Layer 2: Server Actions (Application)
├── Check auth() session
├── Validate workspace role
└── Enforce business rules

Layer 3: Database (PostgreSQL RLS)
├── Check app.workspace_id context
├── Check app.user_id context
└── Enforce row-level policies
```

### Data Protection

| Data Type | Protection |
|-----------|-----------|
| Passwords | bcryptjs hashing (cost factor 12) |
| Sessions | Auth.js encrypted cookies |
| OAuth tokens | Encrypted in `accounts` table |
| Email tokens | One-time use, expiry |
| Payment data | Midtrans handles (PCI compliant) |
| File uploads | Vercel Blob dengan access control |

---

## 7. Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Platform                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Edge       │  │  Serverless │  │  Static Assets      │ │
│  │  Functions  │  │  Functions  │  │  (CDN)              │ │
│  │             │  │             │  │                     │ │
│  │ - Middleware│  │ - Pages     │  │ - Images            │ │
│  │ - API routes│  │ - Server    │  │ - Fonts             │ │
│  │ - Cron jobs │  │   Actions   │  │ - Static files      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  Auto-scaling: Serverless functions scale to 0 when idle    │
│  Global CDN: Edge network untuk static assets               │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   PostgreSQL │  │   Vercel     │  │    Resend    │
│  (Managed)   │  │    Blob      │  │     API      │
│              │  │  (Storage)   │  │   (Email)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Environment Strategy

| Environment | Database | Storage | Email | Payment |
|-------------|----------|---------|-------|---------|
| Development | Docker local | Placeholder | Resend dev | Midtrans sandbox |
| Staging | Managed DB | Vercel Blob | Resend staging | Midtrans sandbox |
| Production | Managed DB | Vercel Blob | Resend production | Midtrans production |

---

## 8. Monitoring & Observability

### Current Setup

| Component | Tool | Status |
|-----------|------|--------|
| Health Check | `/api/v1/health` | ✅ Active |
| Activity Logging | `activity_logs` table | ✅ Active |
| Error Tracking | Console.error | ⚠️ Basic |
| Analytics | None | ❌ Not implemented |
| Performance | None | ❌ Not implemented |

### Recommended Setup

```
┌─────────────────────────────────────────────────────────────┐
│                   Monitoring Stack                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Sentry     │  │  Vercel     │  │  Custom Metrics     │ │
│  │  (Errors)   │  │  Analytics  │  │  (Business KPIs)    │ │
│  │             │  │  (Usage)    │  │                     │ │
│  │ - Error     │  │             │  │ - Active workspaces │ │
│  │   tracking  │  │ - Page views│  │ - Subscription rate │ │
│  │ - Performance│ │ - User flow │  │ - Feature usage     │ │
│  │   monitoring│  │ - Conversion│  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Development Workflow

### Git Branching Strategy

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/task-attachments
  │     ├── feature/budget-export
  │     └── fix/auth-error
  │
  └── release/v1.0.0 (release candidate)
```

### CI/CD Pipeline

```
Push to branch
    │
    ▼
CI (GitHub Actions / Vercel)
    │
    ├── npm install
    ├── npm run typecheck
    ├── npm run lint
    ├── npm test
    └── npm run build
    │
    ▼
Deploy to Vercel (Preview)
    │
    ▼
Manual approval
    │
    ▼
Deploy to Production
```

### Code Review Checklist

- [ ] TypeScript types correct?
- [ ] Zod validation untuk semua input?
- [ ] Auth check di semua server actions?
- [ ] Workspace role check untuk write operations?
- [ ] `withWorkspace` untuk RLS context?
- [ ] `revalidatePath` setelah mutation?
- [ ] Error handling dengan try-catch?
- [ ] Activity logging untuk audit?
- [ ] Empty states untuk list views?
- [ ] Loading states untuk async operations?
- [ ] Mobile responsive?
- [ ] Accessibility (ARIA labels, keyboard navigation)?

---

## 10. Future Considerations

### Scalability

| Component | Current | Future |
|-----------|---------|--------|
| Database | Single PostgreSQL | Read replicas, connection pooling (PgBouncer) |
| Storage | Vercel Blob | Multi-region replication |
| Caching | Next.js cache | Redis for session cache |
| Queue | None | BullMQ for background jobs |
| Search | PostgreSQL full-text | Elasticsearch / Meilisearch |

### Microservices (If Needed)

Jika aplikasi tumbuh sangat besar, potential service boundaries:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Auth       │  │  Workspace  │  │  Notification│  │  Payment    │
│  Service    │  │  Service    │  │  Service     │  │  Service    │
│             │  │             │  │              │  │             │
│ - Login     │  │ - Tasks     │  │ - Email      │  │ - Checkout  │
│ - Session   │  │ - Budget    │  │ - Push       │  │ - Webhook   │
│ - OAuth     │  │ - Vendors   │  │ - WhatsApp   │  │ - Invoice   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Note:** Saat ini monolith adalah pilihan yang tepat. Pertimbangkan microservices hanya saat:
- Team > 10 developers
- Deployment frequency berbeda per fitur
- Scale requirements berbeda per layanan

### Internationalization

Sewaka dirancang untuk pasar Indonesia, tapi arsitektur mendukung i18n:

```typescript
// Future: next-intl integration
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations();
  return <h1>{t("dashboard.title")}</h1>;
}
```

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **Workspace** | Wedding planning space untuk satu pasangan |
| **Server Action** | Next.js function yang berjalan di server, dipanggil dari client |
| **RLS** | Row-Level Security — PostgreSQL feature untuk row-level access control |
| **withWorkspace** | Helper function untuk set RLS context |
| **Snap** | Midtrans payment popup API |
| **Vercel Blob** | Object storage service dari Vercel |
| **Resend** | Email API service |
| **Drizzle** | TypeScript ORM untuk SQL databases |
| **Auth.js** | Authentication library (sebelumnya NextAuth) |
| **shadcn/ui** | Component library berbasis Radix UI |
| **Invitation Cover** | Full-screen halaman pembuka undangan dengan tombol "Buka Undangan" |
| **Story Timeline** | Visual timeline perjalanan cinta dengan milestone (date, title, description, photo) |
| **Hero Carousel** | Slider multiple foto couple di hero section dengan auto-slide |
| **Bulk WhatsApp** | Fitur kirim undangan massal via WhatsApp (max 50/batch) |
| **Love Animation** | Animasi floating hearts CSS saat scroll, toggleable via admin |
