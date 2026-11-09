---
sessionId: session-261108-190150-1u7f
---

# Cultural Workflow Generator (P1)

### Overview
Fitur **diferensiasi utama Sewaka** — dari pilih tradisi → auto-generate checklist, rundown, PIC, dan perlengkapan seserahan. Tidak ada kompetitor yang punya fitur ini.

### Masalah yang Diselesaikan
Saat ini user harus manual mengisi semua komponen pernikahan setelah pilih tradisi. Dengan Cultural Workflow Generator, user cukup:
1. Pilih tradisi (Jawa, Sunda, Minang, Nasional)
2. Klik "Generate Workflow"
3. Sistem otomatis membuat: rundown lengkap, checklist tugas, daftar seserahan, dan PIC recommendation

### Data yang Sudah Ada
- `RUNDOWN_TEMPLATES` — 4 tradisi × 4-5 rundown items dengan rituals, PIC, lokasi, attire
- `CHECKLIST_TEMPLATES` — 4 tradisi × 5-7 checklist items dengan milestone, priority
- `CULTURAL_ENCYCLOPEDIA` — 9 ritual articles dengan ubarampe lengkap
- `culturalRundowns` table — schema sudah ada
- `culturalSeserahanItems` table — schema sudah ada
- `checklistTemplates` + `templateTasks` table — schema sudah ada
- `tasks` table — untuk import ubarampe

### Yang Perlu Dibuat

#### 1. Server Action — `generateCulturalWorkflowAction`
- Input: workspaceId, tradition
- Output: batch insert ke cultural_rundowns, cultural_seserahan_items, dan tasks
- Idempotent: cek dulu apakah sudah ada data untuk workspace ini
- Revalidate: /rundown, /seserahan, /tasks, /encyclopedia

#### 2. Generator Page — `/cultural-workflow`
- UI: Pilih tradisi (card selection dengan preview)
- Preview: Tampilkan apa yang akan di-generate per tradisi
- Progress bar saat generate
- Success state dengan link ke halaman terkait

#### 3. Seserahan Auto-Fill dari Ubarampe
- Map ubarampe dari encyclopedia ke seserahan items
- Set giver_party, box_number, estimated_cost default
- Status: PLANNED

#### 4. Rundown Auto-Fill dari Templates
- Map rundown templates ke cultural_rundowns
- Preserve rituals JSON, PIC, lokasi, attire
- Sort order dari template

#### 5. Checklist Auto-Fill dari Templates
- Map checklist templates ke tasks dengan offset days
- Set priority, category, milestone
- Skip jika task dengan title sama sudah ada

### Database Changes
Tidak perlu migration baru — semua tabel sudah ada:
- `cultural_rundowns` ✓
- `cultural_seserahan_items` ✓
- `tasks` ✓
- `checklist_templates` ✓

### Folder Structure
```
features/
  cultural-workflow/
    actions/
      cultural-workflow-actions.ts (new — server action generate)
    components/
      cultural-workflow-generator.tsx (new — main UI)
      tradition-selector.tsx (new — card picker)
      workflow-preview.tsx (new — preview before generate)
      workflow-progress.tsx (new — progress indicator)
app/
  (app)/
    cultural-workflow/
      page.tsx (new — route page)
```

### Architecture

```mermaid
graph LR
    A[User] --> B[Cultural Workflow Page]
    B --> C[Tradition Selector]
    C --> D[Workflow Preview]
    D --> E[Generate Button]
    E --> F[generateCulturalWorkflowAction]
    F --> G[cultural_rundowns Table]
    F --> H[cultural_seserahan_items Table]
    F --> I[tasks Table]
    G --> J[/rundown Page]
    H --> K[/seserahan Page]
    I --> L[/tasks Page]
```

### Delivery Steps

### ✓ Step 1: Server Action — Generate Cultural Workflow
Buat server action yang meng-generate semua komponen dari template.
- Buat features/cultural-workflow/actions/cultural-workflow-actions.ts
- Fungsi generateCulturalWorkflowAction(workspaceId, tradition)
- Batch insert: rundown, seserahan, tasks
- Idempotent check: skip jika sudah ada data
- Revalidate paths: /rundown, /seserahan, /tasks
- Validasi workspace access

### ✓ Step 2: Generator Page & UI Components
Buat halaman utama dan komponen UI generator.
- Buat app/(app)/cultural-workflow/page.tsx
- Buat features/cultural-workflow/components/cultural-workflow-generator.tsx
- Buat tradition-selector.tsx — card picker 4 tradisi
- Buat workflow-preview.tsx — preview apa yang akan di-generate
- Buat workflow-progress.tsx — progress indicator
- Integrasi dengan server action

### ✓ Step 3: Navigation & Integration
Tambah navigasi dan integrasi dengan halaman existing.
- Tambah link di app-sidebar.tsx — "Workflow Adat" di section Perencanaan
- Tambah CTA di encyclopedia page — "Generate Workflow dari Tradisi Ini"
- Tambah CTA di onboarding jika culturalTradition dipilih
- Validasi TypeScript compilation

### ✓ Step 4: Testing & Documentation
Test dan update dokumentasi.
- Test generate workflow untuk 4 tradisi
- Test idempotent — generate ulang tidak duplikat
- Test revalidate paths
- Update CHANGELOG.md dan docs/architecture.md
- Update README.md
