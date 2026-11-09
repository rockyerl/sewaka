---
sessionId: session-261108-190150-1u7f
---

# Requirements & Scope

### Overview
Implementasi semua fitur pending dari notes sebelumnya: WhatsApp Reminder Cron Job, Check-in Audit Logs UI, dan Admin Dashboard Analytics.

### Fitur yang Akan Diimplementasikan

#### 1. WhatsApp Reminder Cron Job
- Cron job otomatis kirim reminder WhatsApp 7 hari dan 1 hari sebelum wedding date
- Gunakan `whatsapp_messages` table yang sudah ada untuk tracking
- Endpoint cron baru: `/api/cron/whatsapp-reminders`
- Konfigurasi di `vercel.json`

#### 2. Check-in Audit Logs UI
- Admin dashboard untuk monitor check-in audit logs
- Tabel dengan filter: tanggal, status, device
- Sync status monitoring untuk offline queue
- Conflict resolution UI

#### 3. Admin Dashboard Analytics
- Chart RSVP: pie chart konfirmasi (Hadir, Tidak Hadir, Ragu-ragu)
- Budget vs Actual: bar chart pengeluaran per kategori
- Guest attendance trends: line chart check-in per event
- Vendor comparison: table dengan rating dan status

# Technical Design

### Current Implementation
- **WhatsApp Messages**: `features/whatsapp-rsvp/actions/whatsapp-rsvp-actions.ts` — sudah ada send message action
- **Check-in Logs**: `check_in_logs` table sudah ada dengan audit trail
- **Dashboard**: `app/(app)/dashboard/page.tsx` — sudah ada stat cards
- **Cron**: `app/api/cron/notifications/route.ts` — sudah ada untuk notifications

### Key Decisions

#### 1. WhatsApp Reminder: Cron Job
- Vercel Cron job berjalan setiap jam
- Query workspaces dengan wedding_date dalam 7 hari
- Generate reminder message per tamu yang belum RSVP
- Simpan ke whatsapp_messages untuk tracking

#### 2. Check-in Audit Logs: Admin Page
- Baru page: `app/(app)/check-in-logs/page.tsx`
- Server component dengan pagination
- Client component untuk filter dan export

#### 3. Dashboard Analytics: Chart Components
- Gunakan recharts untuk charts (sudah ada di package.json)
- Server actions untuk fetch analytics data
- Client components untuk interaktif charts

### Proposed Changes Summary

1. **Cron Job** — WhatsApp reminder otomatis
2. **Check-in Logs UI** — Admin dashboard monitoring
3. **Dashboard Analytics** — 4 chart components
4. **Documentation** — Update CHANGELOG, architecture, README

# Delivery Steps

### ✓ Step 1: WhatsApp Reminder Cron Job
Buat cron job untuk otomatis kirim reminder WhatsApp.
- Buat `app/api/cron/whatsapp-reminders/route.ts` — endpoint cron
- Update `vercel.json` — tambah schedule untuk whatsapp-reminders
- Buat server action `sendWeddingReminderAction` di whatsapp-rsvp actions
- Query workspaces dengan wedding_date dalam 7 hari dan 1 hari
- Generate reminder message per tamu yang belum RSVP
- Simpan ke whatsapp_messages untuk tracking

### ✓ Step 2: Check-in Audit Logs UI
Buat admin dashboard untuk monitor check-in audit logs.
- Buat `app/(app)/check-in-logs/page.tsx` — server page
- Buat `features/guests/components/check-in-logs-view.tsx` — client component
- Server action `getCheckInLogsAction` dengan pagination dan filter
- Tabel dengan kolom: tamu, waktu, device, status, sync status
- Filter: tanggal range, status, search tamu
- Export CSV button
- Tambah navigasi di sidebar

### ✓ Step 3: Dashboard Analytics
Tambah chart analytics di dashboard admin.
- Buat `features/analytics/actions/analytics-actions.ts` — server actions
- Buat `features/analytics/components/analytics-dashboard.tsx` — 4 chart dalam satu komponen
- Buat `app/(app)/analytics/page.tsx` — server page
- Tambah navigasi "Analytics" di sidebar section UTAMA

### ✓ Step 4: Navigation & Documentation
Tambah navigasi dan update dokumentasi.
- Tambah "Audit Logs Check-in" di sidebar section ACARA
- Tambah "Analytics" di sidebar section UTAMA
- Update CHANGELOG.md — WhatsApp Reminder, Check-in Logs, Analytics
- Update docs/architecture.md — component hierarchy, design decisions
- Update README.md — fitur baru
- Test TypeScript compilation — ✅ 0 errors
