# Struktur Folder Next.js: Feature-Based + Aturan Bulletproof React

Panduan ini menggabungkan dua hal:

- **Struktur folder feature-based** yang disesuaikan untuk Next.js App Router (server components, server actions, Drizzle).
- **Aturan ketat dari Bulletproof React**: alur dependensi satu arah, larangan impor antar fitur, dan penegakannya lewat ESLint.

Simpan sebagai `STRUCTURE.md` di root project atau di `docs/`.

---

## 1. Prinsip

1. **`app/` hanya untuk routing dan komposisi.** Isinya `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`. Tanpa logika bisnis.
2. **`features/` untuk logika per domain** (tasks, budgets, events, notifications). Semua yang berkaitan dengan satu fitur ada di satu tempat.
3. **Folder shared (`components/`, `lib/`, `hooks/`, `config/`, `types/`) hanya untuk yang dipakai lintas fitur.**
4. **Alur dependensi satu arah:**

```
shared (components, lib, hooks, config, types)
        ->  features
                ->  app
```

Kode boleh mengimpor dari kiri ke kanan pada diagram di atas, tidak sebaliknya. Artinya:

- `features/*` boleh mengimpor dari shared, **tidak boleh** dari `app/`.
- shared **tidak boleh** mengimpor dari `features/` atau `app/`.
- `features/a` **tidak boleh** mengimpor dari `features/b`.
- `app/` boleh mengimpor dari mana saja dan bertugas menyatukan beberapa fitur.

Aturan ini **ditegakkan oleh ESLint** (bagian 6), bukan hanya disepakati.

---

## 2. Struktur default satu fitur

Buat subfolder hanya ketika dibutuhkan, jangan membuat folder kosong "untuk nanti".

```
features/
└── tasks/
    ├── actions/          # server actions (mutasi): create, update, delete
    │   ├── create-task.ts
    │   └── update-task.ts
    ├── queries/          # fungsi baca data dari DB (server only)
    │   └── get-tasks.ts
    ├── components/       # komponen UI khusus fitur ini
    │   ├── task-list.tsx
    │   ├── task-card.tsx
    │   └── task-form.tsx
    ├── hooks/            # hook khusus fitur (client)
    │   └── use-task-filters.ts
    ├── schemas/          # validasi input (zod)
    │   └── task-schema.ts
    ├── types.ts
    ├── constants.ts
    └── index.ts          # public API kecil (opsional, lihat bagian 5)
```

| Folder / file | Isi | Jalan di |
|---|---|---|
| `actions/` | Server actions yang mengubah data (`"use server"`) | Server |
| `queries/` | Query `select` ke DB, dipanggil dari server component | Server |
| `components/` | Komponen React khusus fitur | Server / Client |
| `hooks/` | Hook React (state, efek) | Client |
| `schemas/` | Skema zod, dipakai form dan action | Keduanya |
| `types.ts` | Tipe dan interface | Keduanya |
| `constants.ts` | Konstanta, enum, label | Keduanya |
| `index.ts` | Ekspor publik fitur (kecil, selektif) | - |

> **Beda dengan Bulletproof React asli:** Bulletproof memakai folder `api/` untuk fetch dari client ke REST API. Di Next.js dengan Drizzle, query langsung dari server, jadi `api/` diganti `queries/` dan `actions/`. Aturan dependensinya tetap sama.

---

## 3. Struktur lengkap project

```
com.sewaka-web/
├── app/
│   ├── (auth)/                       # route group, tidak muncul di URL
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── budgets/page.tsx
│   │   └── events/page.tsx
│   ├── api/
│   │   └── cron/
│   │       └── notifications/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── features/
│   ├── tasks/
│   ├── budgets/
│   ├── events/
│   └── notifications/
│       ├── actions/
│       │   └── notification-scheduler.ts
│       ├── components/
│       └── types.ts
│
├── components/
│   ├── ui/                           # button, input, dialog (shadcn/ui)
│   └── layout/                       # navbar, sidebar, footer
│
├── lib/
│   ├── db/
│   │   ├── index.ts                  # getDb()
│   │   ├── schema/                   # tabel drizzle: tasks.ts, budgets.ts, ...
│   │   └── migrations/
│   ├── auth.ts
│   ├── env.ts                        # validasi environment variable
│   └── utils.ts
│
├── hooks/                            # hook lintas fitur
├── config/                           # site config, konstanta global
├── types/                            # tipe global
├── testing/                          # setup test, mock, helper (opsional)
├── scripts/                          # ngrok-dev.mjs, seed, dll
├── public/
├── .env
└── package.json
```

---

## 4. Contoh alur dalam satu fitur

**`features/tasks/queries/get-tasks.ts`**
```ts
import "server-only";
import { getDb } from "@/lib/db";
import { tasks } from "@/lib/db/schema/tasks";
import { eq } from "drizzle-orm";

export async function getTasks(workspaceId: string) {
  const db = getDb();
  return db.select().from(tasks).where(eq(tasks.workspaceId, workspaceId));
}
```

`import "server-only"` membuat build gagal kalau file ini tidak sengaja diimpor dari client component, jadi query DB tidak bisa bocor ke browser.

**`features/tasks/components/task-list.tsx`** (server component)
```tsx
import { getTasks } from "../queries/get-tasks";
import { TaskCard } from "./task-card";

export async function TaskList({ workspaceId }: { workspaceId: string }) {
  const items = await getTasks(workspaceId);
  return (
    <div className="grid gap-3">
      {items.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  );
}
```

**`app/(dashboard)/tasks/page.tsx`** (tipis, hanya menyusun)
```tsx
import { TaskList } from "@/features/tasks/components/task-list";

export default function TasksPage() {
  return <TaskList workspaceId="..." />;
}
```

**Cron route tetap tipis:** `app/api/cron/notifications/route.ts`
```ts
import { runNotificationScheduler } from "@/features/notifications/actions/notification-scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await runNotificationScheduler();
  return Response.json({ ok: true });
}
```

---

## 5. Aturan praktis

- **Impor langsung ke file, hindari barrel besar.** Bulletproof React tidak menyarankan `index.ts` yang me-re-export semuanya, karena memperlambat build dan memicu circular import. Cukup impor langsung: `@/features/tasks/components/task-list`. Kalau tetap mau `index.ts`, buat kecil dan hanya untuk apa yang memang dipakai `app/`.
- **Jangan impor antar fitur.** Kalau fitur A butuh sesuatu dari fitur B, ada tiga pilihan:
  1. Susun keduanya di level `app/` (page yang memanggil komponen A dan B).
  2. Pindahkan bagian yang dipakai bersama ke `components/` atau `lib/`.
  3. Oper data lewat props atau parameter fungsi.
- **Dekat dengan pemakainya.** Komponen yang hanya dipakai satu halaman boleh di `app/.../_components/` (awalan `_` membuat Next.js mengabaikannya sebagai route).
- **Pisahkan server dan client.** Tandai komponen interaktif dengan `"use client"`. Fungsi yang menyentuh DB diberi `import "server-only"`.
- **Pakai alias `@/`** (sudah ada di `tsconfig.json` bawaan) supaya tidak ada `../../../`.
- **Penamaan:** folder dan file `kebab-case` (`task-list.tsx`), komponen `PascalCase` di dalamnya.
- **Mulai sederhana.** Tambah subfolder ketika file sudah mulai banyak.

---

## 6. Menegakkan aturan dengan ESLint

Instal plugin dan resolver (supaya alias `@/` dikenali):

```bash
npm i -D eslint-plugin-import eslint-import-resolver-typescript
```

Tambahkan ke `eslint.config.mjs`. Ini contoh untuk flat config; sesuaikan dengan isi config-mu yang sekarang.

```js
import importPlugin from "eslint-plugin-import";

export default [
  // ... config Next.js yang sudah ada

  {
    files: ["**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 1. Antar fitur tidak boleh saling impor.
            //    Tambahkan satu baris per fitur baru.
            { target: "./features/tasks",         from: "./features", except: ["./tasks"] },
            { target: "./features/budgets",       from: "./features", except: ["./budgets"] },
            { target: "./features/events",        from: "./features", except: ["./events"] },
            { target: "./features/notifications", from: "./features", except: ["./notifications"] },

            // 2. Fitur tidak boleh mengimpor dari app/
            { target: "./features", from: "./app" },

            // 3. Shared code tidak boleh mengimpor dari features/ atau app/
            {
              target: ["./components", "./lib", "./hooks", "./config", "./types"],
              from: ["./features", "./app"],
            },
          ],
        },
      ],
    },
  },
];
```

Cara kerjanya: `target` adalah folder yang dibatasi, `from` adalah folder yang dilarang diimpor, `except` adalah pengecualian relatif terhadap `from` (di sini folder fitur itu sendiri). Setelah ini, impor yang melanggar aturan langsung muncul sebagai error di WebStorm dan saat `npm run lint`.

Tes cepat: sengaja impor sesuatu dari `features/budgets` di dalam `features/tasks`. Kalau konfigurasinya benar, ESLint langsung menolaknya.

---

## 7. Cara menerapkan ke project yang sudah ada

Lakukan bertahap, satu fitur per commit supaya mudah di-rollback.

1. **Pilih satu fitur** (mulai dari `notifications`, karena sudah ada di `features/`).
2. **Buat folder fiturnya** dan pindahkan file terkait: action ke `actions/`, query ke `queries/`, komponen ke `components/`.
3. **Perbarui import** memakai alias `@/features/...`. Di WebStorm pakai Move (`F6`) supaya import ikut terupdate otomatis.
4. **Tambahkan `import "server-only"`** di file `queries/` dan `actions/` yang menyentuh DB.
5. **Aktifkan aturan ESLint** (bagian 6) setelah beberapa fitur sudah dipindah, lalu perbaiki pelanggaran yang muncul.
6. **Verifikasi:** `npx tsc --noEmit`, `npm run lint`, lalu `npm run build`.
7. **Ulangi** untuk fitur berikutnya (tasks, budgets, events).
8. **Terakhir,** rapikan sisa file di `components/` dan `lib/`: yang hanya dipakai satu fitur dipindah ke fiturnya.

---

## 8. Checklist

- [ ] `app/` hanya berisi routing dan komposisi, tanpa logika bisnis
- [ ] Setiap domain punya folder sendiri di `features/`
- [ ] Alur dependensi: shared -> features -> app, ditegakkan ESLint
- [ ] Tidak ada impor langsung antar fitur
- [ ] Tidak ada barrel `index.ts` besar
- [ ] File query/action DB memakai `import "server-only"`
- [ ] Skema DB di `lib/db/schema/`, satu file per tabel
- [ ] Komponen client ditandai `"use client"`
- [ ] Endpoint cron memverifikasi `CRON_SECRET` dan `dynamic = "force-dynamic"`
- [ ] Environment variable divalidasi di `lib/env.ts`

---

## 9. Kapan pilih yang mana

- **Project kecil sampai menengah, solo atau tim kecil:** pakai panduan ini apa adanya.
- **Tim besar atau umur project panjang:** perketat lagi: tambah test per fitur, hapus semua barrel, dan pertimbangkan alat seperti `dependency-cruiser` untuk memetakan dependensi.
- **SPA murni dengan REST API terpisah:** ikuti Bulletproof React asli, termasuk folder `api/` per fitur.
