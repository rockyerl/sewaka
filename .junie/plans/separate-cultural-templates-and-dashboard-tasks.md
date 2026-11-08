---
sessionId: session-261107-125758-wxar
---

# Requirements

**Tujuan:** Memisahkan template budaya (Jawa, Sunda, Minang, Nasional) menjadi dua file terpisah dan menampilkan tugas di dashboard.

**Masalah saat ini:**
- Template rundown acara dan checklist persiapan tergabung di satu file `cultural-templates.ts`
- Checklist template dikosongkan di sesi sebelumnya, sehingga tugas tidak muncul saat workspace baru dibuat
- Dashboard tidak menampilkan daftar tugas yang akan datang

**Solusi:**
1. Pisahkan `cultural-templates.ts` menjadi dua file: `rundown-templates.ts` dan `checklist-templates.ts`
2. Kembalikan data checklist template yang dihapus
3. Tampilkan tugas yang akan datang di dashboard

# Technical Design

### Implementasi Saat Ini

**File yang menggunakan cultural-templates:**
- `workspace-queries.ts`: Menggunakan `checklistTemplate` untuk seed tasks dan `rundownTemplate` untuk seed rundowns
- `rundown-queries.ts`: Menggunakan `CULTURAL_TRADITIONS` untuk info tradisi
- `workspace-setup.tsx`: Menggunakan `CULTURAL_TRADITIONS` untuk dropdown jenis pernikahan
- `guest-queries.ts`: Menggunakan `CulturalTradition` type
- `cultural-encyclopedia.ts`: Menggunakan `CulturalTradition` type

**Dashboard:**
- Menampilkan: countdown, quick actions, stat cards, calendar view, inspiration card
- Tidak ada section untuk tugas/checklist

### Keputusan Kunci

**1. Pisahkan menjadi dua file**
- `lib/constants/rundown-templates.ts` — berisi rundown template per jenis pernikahan
- `lib/constants/checklist-templates.ts` — berisi checklist template per jenis pernikahan
- `lib/constants/cultural-templates.ts` — tetap ada, berisi info tradisi (nama, tagline, attire, dll) + re-export dari kedua file

**2. Kembalikan data checklist**
- Restore checklist template untuk Jawa, Sunda, Minang, dan Nasional yang dihapus di sesi sebelumnya

**3. Tampilkan tugas di dashboard**
- Tambahkan section "Tugas yang Akan Datang" di dashboard
- Fetch tasks dari `listWorkspaceTasks` dan tampilkan 5 tugas terdekat yang belum selesai
- Link ke halaman `/tasks` untuk melihat semua tugas

### Perubahan yang Diusulkan

**File Baru:**
- `lib/constants/rundown-templates.ts` — rundown template per tradisi
- `lib/constants/checklist-templates.ts` — checklist template per tradisi

**File yang Diubah:**
- `lib/constants/cultural-templates.ts` — hanya berisi info tradisi, re-export dari kedua file baru
- `features/workspaces/hooks/workspace-queries.ts` — import dari file yang sudah dipisah
- `features/dashboard/components/dashboard-page-content.tsx` — tambahkan section tugas

# Delivery Steps

### ✓ Step 1: Buat file rundown-templates.ts
Pindahkan rundown template dari cultural-templates.ts ke file baru.

- Buat `lib/constants/rundown-templates.ts` dengan `RUNDOWN_TEMPLATES` record per CulturalTradition
- Setiap item berisi: title, ceremonyType, timeStart, timeEnd, picName, location, attire, rituals, notes, sortOrder

### ✓ Step 2: Buat file checklist-templates.ts
Kembalikan dan pindahkan checklist template ke file baru.

- Buat `lib/constants/checklist-templates.ts` dengan `CHECKLIST_TEMPLATES` record per CulturalTradition
- Restore data checklist untuk Jawa, Sunda, Minang, dan Nasional dari git history
- Setiap item berisi: title, description, category, milestone, offsetDays, priority

### ✓ Step 3: Update cultural-templates.ts
Sederhanakan file asli hanya berisi info tradisi.

- Hapus `rundownTemplate` dan `checklistTemplate` dari `CULTURAL_TRADITIONS`
- Tambahkan property `rundownTemplate` dan `checklistTemplate` yang di-compute dari file terpisah
- Re-export types dan constants agar backward compatible

### ✓ Step 4: Tampilkan tugas di dashboard
Tambahkan section "Tugas yang Akan Datang" di dashboard.

- Fetch `listWorkspaceTasks(workspaceId)` di dashboard
- Filter tugas yang belum selesai (TODO atau IN_PROGRESS)
- Tampilkan 5 tugas terdekat sebagai list dengan badge prioritas
- Link ke `/tasks` untuk melihat semua tugas

### ✓ Step 5: Build dan verifikasi
Verifikasi semua perubahan berfungsi dengan benar.

- `npm run build` berhasil
- Dashboard menampilkan tugas yang akan datang
- Workspace baru masih bisa seed tasks dan rundowns dengan benar
