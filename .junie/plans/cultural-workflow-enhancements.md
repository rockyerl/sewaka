---
sessionId: session-261108-190150-1u7f
---

# Requirements & Scope

### Overview
Enhancement Cultural Workflow Generator berdasarkan TODO yang tertinggal: source column di tasks untuk track generated vs manual, CTA di encyclopedia page ke workflow generator, dan onboarding integration.

### Fitur yang Akan Diimplementasikan

#### 1. Source Column di Tasks
- Tambah kolom `source` di tasks table untuk track asal task: 'MANUAL', 'CULTURAL_WORKFLOW', 'ENCYCLOPEDIA'
- Perbaiki `resetCulturalWorkflowAction` agar hanya hapus tasks dengan source 'CULTURAL_WORKFLOW'
- Update `generateCulturalWorkflowAction` untuk set source saat generate

#### 2. CTA di Encyclopedia Page
- Tambah banner/CTA di cultural-encyclopedia-view.tsx yang mengarah ke /cultural-workflow
- Banner muncul hanya jika workflow belum di-generate untuk workspace

#### 3. Onboarding Integration
- Tambah step baru di onboarding wizard setelah step 4: "Generate Workflow Adat"
- Otomatis redirect ke /cultural-workflow setelah onboarding selesai
- Atau tampilkan CTA di step 5 "Selesai!" untuk generate workflow

#### 4. Dokumentasi
- Update CHANGELOG.md, architecture.md, README.md

# Technical Design

### Current Implementation
- **Tasks table**: `lib/db/schema.ts` line 395-437 — tidak ada source column
- **Cultural Workflow Actions**: `features/cultural-workflow/actions/cultural-workflow-actions.ts` — TODO di line 192
- **Encyclopedia View**: `features/encyclopedia/components/cultural-encyclopedia-view.tsx` — 286 lines, sudah ada import ubarampe
- **Onboarding Wizard**: `features/workspaces/components/onboarding-wizard.tsx` — 330 lines, 5 steps

### Database Changes (Migration 0028)
```sql
-- Source column untuk track asal task
ALTER TABLE "tasks" ADD COLUMN "source" text DEFAULT 'MANUAL';
ALTER TABLE "tasks" ALTER COLUMN "source" SET DATA TYPE text;

-- Index untuk query tasks by source
CREATE INDEX "idx_tasks_workspace_source" ON "tasks"("workspace_id", "source");
```

### Schema Updates (`lib/db/schema.ts`)
Tambahkan di tasks table:
- `source: text('source').default('MANUAL')`

### Key Decisions

#### 1. Source Column: Text, Bukan Enum
- Gunakan text bukan enum agar fleksibel untuk source baru di masa depan
- Default 'MANUAL' untuk backward compatibility — tasks existing tetap 'MANUAL'
- Nilai: 'MANUAL', 'CULTURAL_WORKFLOW', 'ENCYCLOPEDIA'

#### 2. CTA di Encyclopedia: Banner di Atas
- Tambah banner di atas toolbar filters
- Muncul hanya jika workflow belum di-generate
- Link ke /cultural-workflow dengan pre-selected tradition

#### 3. Onboarding: CTA di Step 5
- Tidak tambah step baru agar tidak memperpanjang onboarding
- Tambah CTA button di step 5 "Selesai!" untuk langsung ke workflow generator
- User bisa skip jika tidak ingin generate sekarang

### Proposed Changes Summary

1. **Migration SQL** — 1 kolom baru + 1 index di tasks
2. **Schema** — update tasks table dengan source column
3. **Actions** — update generateCulturalWorkflowAction dan resetCulturalWorkflowAction
4. **Encyclopedia CTA** — banner di cultural-encyclopedia-view.tsx
5. **Onboarding CTA** — button di onboarding-wizard.tsx step 5
6. **Documentation** — update CHANGELOG, architecture, README

# Delivery Steps

### ✓ Step 1: Migration & Schema Updates
Tambahkan source column di tasks table dan update schema Drizzle.
- Buat drizzle/0028_tasks_source_column.sql dengan ALTER TABLE untuk source column + index
- Update lib/db/schema.ts — tambahkan source field di tasks table
- Jalankan migration ke database Neon — berhasil!
- Validasi kolom baru ada di database

### ✓ Step 2: Update Cultural Workflow Actions
Perbaiki actions untuk menggunakan source column.
- Update generateCulturalWorkflowAction — set source: 'CULTURAL_WORKFLOW' saat insert tasks
- Update resetCulturalWorkflowAction — hapus hanya tasks dengan source 'CULTURAL_WORKFLOW'
- Update importUbarampeToTasksAction di encyclopedia-actions.ts — set source: 'ENCYCLOPEDIA'
- TypeScript compilation: ✓ 0 errors

### ✓ Step 3: CTA di Encyclopedia & Onboarding
Tambah CTA untuk mengarah user ke workflow generator.
- Update cultural-encyclopedia-view.tsx — tambah banner CTA di atas filters, cek workflow status
- Update onboarding-wizard.tsx — tambah button "Generate Workflow Adat" di step 5
- Reuse checkWorkflowStatusAction untuk cek workflow status dari encyclopedia page
- Validasi CTA muncul hanya saat workflow belum di-generate
- TypeScript compilation: ✓ 0 errors

### ✓ Step 4: Documentation & Final Integration
Update dokumentasi dan validasi semua perubahan.
- Update CHANGELOG.md — ✅ Task Source Tracking, Encyclopedia CTA, Onboarding CTA
- Update docs/architecture.md — ✅ Design decisions updated, glossary 2 istilah baru
- Update README.md — ✅ Cultural Features section di-update
- Test TypeScript compilation — ✅ 0 errors
- Test ESLint — ✅ 0 errors baru
- Validasi semua komponen ter-integrasi dengan benar
