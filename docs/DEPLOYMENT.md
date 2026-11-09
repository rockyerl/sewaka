# Sewaka Production Deployment Guide

Panduan lengkap untuk deploying Sewaka ke production di Vercel.

---

## Prerequisites

- Akun GitHub dengan repository Sewaka
- Akun Vercel (gratis untuk hobby project)
- Domain `sewaka.com` (atau domain lain yang kamu miliki)
- Database PostgreSQL (Neon, Supabase, atau similar)
- Akun Midtrans untuk payment gateway
- Akun Resend untuk email service

---

## Step 1: Setup Production Database

### Opsi A: Neon (Recommended)

1. Daftar di [neon.tech](https://neon.tech)
2. Buat project baru
3. Copy connection string:
   - **Database URL** (pooler): `postgres://user:password@ep-xxx.region.aws.neon.tech/sewaka?sslmode=require`
   - **Migration Database URL** (direct): `postgres://user:password@ep-xxx.region.aws.neon.tech/sewaka?sslmode=require` (tanpa `?pgbouncer=true`)

### Opsi B: Supabase

1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Copy connection string dari Settings > Database

### Jalankan Migrations

```bash
# Set environment variables
$env:DATABASE_URL = "your_migration_database_url"

# Run migrations
node run-migrations.js
```

Verifikasi semua tabel ada:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

---

## Step 2: Deploy ke Vercel

### Connect Repository

1. Login ke [vercel.com](https://vercel.com)
2. Click "Add New..." > "Project"
3. Import repository GitHub Sewaka
4. Vercel akan auto-detect Next.js framework

### Configure Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)

### Set Environment Variables

Di Vercel Dashboard > Project Settings > Environment Variables, tambahkan:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Production DB URL (pooler) | Production |
| `MIGRATION_DATABASE_URL` | Production DB URL (direct) | Production |
| `AUTH_SECRET` | Random secret (generate: `openssl rand -base64 32`) | Production |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Production |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Production |
| `RESEND_API_KEY` | `re_xxxxx` dari Resend dashboard | Production |
| `MAIL_FROM` | `noreply@sewaka.com` (setelah domain verified) | Production |
| `MIDTRANS_SERVER_KEY` | `VT-server-xxxxx` | Production |
| `MIDTRANS_CLIENT_KEY` | `VT-client-xxxxx` | Production |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | `VT-client-xxxxx` (sama dengan CLIENT_KEY) | Production |
| `BLOB_READ_WRITE_TOKEN` | Token dari Vercel Blob | Production |
| `CRON_SECRET` | Random secret untuk cron job | Production |

> **Important:** Set variables untuk **Production**, **Preview**, dan **Development** environment sesuai kebutuhan.

### Deploy

1. Click "Deploy"
2. Tunggu build selesai (~2-5 menit)
3. Akses URL production: `https://sewaka.vercel.app`

---

## Step 3: Setup Custom Domain

1. Vercel Dashboard > Project > Settings > Domains
2. Enter `sewaka.com` dan `www.sewaka.com`
3. Vercel akan memberikan DNS records yang perlu ditambahkan di domain registrar:
   - **Type**: CNAME
   - **Name**: `@` (untuk sewaka.com) dan `www`
   - **Value**: `cname.vercel-dns.com`

4. Update DNS records di domain registrar (Niagahoster, Cloudflare, dll)
5. Tunggu DNS propagation (biasanya 1-24 jam)
6. SSL certificate akan otomatis provisioned oleh Vercel

---

## Step 4: Setup Vercel Blob Storage

### Enable Blob Storage

1. Vercel Dashboard > Project > Storage
2. Click "Connect" pada Vercel Blob
3. Ikuti instruksi untuk enable Blob storage

### Get Token

1. Setelah connected, Vercel akan otomatis set `BLOB_READ_WRITE_TOKEN` di environment variables
2. Verifikasi token ada di Settings > Environment Variables

### Test Upload

1. Deploy aplikasi
2. Login ke production
3. Upload file di `/gallery`, `/documents`, atau `/contracts`
4. Verifikasi file tersimpan dan bisa diakses

---

## Step 5: Verify Email Domain di Resend

### Add Domain

1. Login ke [resend.com/dashboard](https://resend.com/dashboard)
2. Domains > Add Domain
3. Enter `sewaka.com`

### Add DNS Records

Resend akan memberikan DNS records yang perlu ditambahkan:

| Type | Name | Value |
|------|------|-------|
| TXT | `_dmarc.sewaka.com` | `v=DMARC1; p=none;` |
| TXT | `sewaka.com` | `v=spf1 include:spf.resend.com ~all` |
| CNAME | `resend._domainkey.sewaka.com` | `resend.domainkey.yourdomain.com` |

### Verify

1. Tunggu DNS propagation (24-48 jam)
2. Verifikasi di Resend dashboard
3. Update `MAIL_FROM` di Vercel environment ke `noreply@sewaka.com`

### Test Email

1. Register akun baru di production
2. Verifikasi email verification code terkirim
3. Test forgot password flow

---

## Step 6: Setup Cron Jobs

### Verify Cron Configuration

File `vercel.json` sudah dikonfigurasi:
```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Verify After Deploy

1. Vercel Dashboard > Project > Settings > Cron Jobs
2. Verifikasi cron job aktif
3. Test manual execution: Vercel Dashboard > Cron Jobs > Run Now
4. Monitor logs di Vercel Dashboard > Analytics > Cron

---

## Step 7: Create First Admin User

Setelah deploy, buat admin user pertama:

```sql
-- Run di production database
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Verifikasi akses admin:
1. Login dengan email yang sudah di-set
2. Akses `/admin/dashboard`
3. Verifikasi semua halaman admin berfungsi

---

## Step 8: Enable Vercel Analytics

1. Vercel Dashboard > Project > Analytics
2. Click "Enable"
3. Tunggu 24 jam untuk data muncul

---

## Step 9: Setup Monitoring

### Error Tracking

Vercel sudah include error tracking otomatis. Untuk lebih advanced:

**Sentry (Optional)**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Health Check

Endpoint: `https://sewaka.com/api/v1/health`

Setup monitoring dengan:
- **UptimeRobot** (gratis): Monitor setiap 5 menit
- **Pingdom** (berbayar): Monitor setiap 1 menit
- **Better Stack**: Alerting + status page

### Database Monitoring

- **Neon**: Built-in query analytics
- **Supabase**: Built-in performance insights
- **pgAdmin**: Manual monitoring

---

## Step 10: Pre-Launch Checklist

- [ ] Build sukses tanpa error (`npm run build`)
- [ ] Semua environment variables ter-set di Vercel
- [ ] Database migrations berhasil dijalankan
- [ ] Custom domain configured dan SSL aktif
- [ ] Vercel Blob storage aktif
- [ ] Email domain verified di Resend
- [ ] Cron jobs aktif
- [ ] Admin user pertama dibuat
- [ ] Test critical flows:
  - [ ] Sign up → Login → Workspace setup
  - [ ] Create task → Update status → Complete
  - [ ] Add budget → Record expense → View report
  - [ ] Add vendor → Create quotation → Accept
  - [ ] Add guest → Generate QR → Check-in
  - [ ] Upload file (gallery, documents, contracts)
  - [ ] Send email (verification, password reset)
  - [ ] Payment flow (Midtrans sandbox)
- [ ] Mobile responsiveness tested
- [ ] Accessibility tested
- [ ] Sitemap.xml accessible: `https://sewaka.com/sitemap.xml`
- [ ] Robots.txt accessible: `https://sewaka.com/robots.txt`
- [ ] Health check endpoint working: `https://sewaka.com/api/v1/health`

---

## Rollback Procedure

### Rollback Deployment

1. Vercel Dashboard > Project > Deployments
2. Click deployment sebelumnya
3. Click "Promote to Production"

### Rollback Database

Jika migration bermasalah:
```sql
-- Backup sebelum rollback
pg_dump -h host -U user -d sewaka > backup_$(date +%Y%m%d).sql

-- Rollback manual (drop tabel yang baru dibuat)
DROP TABLE IF EXISTS table_name CASCADE;
```

### Emergency Contacts

- **Database issue**: Cek Vercel logs + Neon/Supabase dashboard
- **Email issue**: Cek Resend dashboard > Activity
- **Payment issue**: Cek Midtrans dashboard > Transaction
- **Blob storage issue**: Cek Vercel Storage > Blob

---

## Post-Launch

### Monitor

- Vercel Analytics: Usage patterns
- Vercel Error Tracking: Runtime errors
- Resend Dashboard: Email delivery rate
- Midtrans Dashboard: Payment success rate
- Database: Query performance

### Backup Strategy

- **Neon**: Automated daily backup (retention 7 days)
- **Supabase**: Automated backup (retention varies by plan)
- **Manual**: `pg_dump` weekly ke local storage

### Scaling

- **Vercel**: Auto-scaling (serverless)
- **Database**: Upgrade plan jika needed
- **Blob Storage**: Monitor usage, upgrade jika接近 limit

---

## Troubleshooting

### Build Fails

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Database Connection Error

- Verify `DATABASE_URL` correct
- Check firewall rules (Neon/Supabase)
- Verify pooler vs direct connection

### Email Not Sending

- Check Resend dashboard for errors
- Verify domain verified
- Check `MAIL_FROM` matches verified domain

### File Upload Fails

- Verify `BLOB_READ_WRITE_TOKEN` set
- Check Vercel Blob storage quota
- Test upload size limit (default 50MB)

### Cron Job Not Running

- Verify `vercel.json` cron config
- Check Vercel plan (Hobby supports cron)
- Monitor cron logs in Vercel dashboard

---

## Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Resend Docs](https://resend.com/docs)
- [Midtrans Docs](https://docs.midtrans.com)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
