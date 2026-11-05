# Post-Launch Guide

Panduan monitoring, maintenance, dan iterasi setelah Sewaka diluncurkan ke production.

## Monitoring

### 1. Vercel Dashboard
- **Analytics**: Monitor page views, unique visitors, dan engagement
- **Error Tracking**: Lihat error yang terjadi di production
- **Function Logs**: Monitor API routes dan cron job execution
- **Edge Logs**: Lihat request/response di edge network

**Link**: https://vercel.com/dashboard > Sewaka project

### 2. Database Monitoring (Neon/Supabase)
- **Query Performance**: Monitor slow queries
- **Connection Pool**: Pastikan tidak ada connection leak
- **Storage Usage**: Monitor database size growth
- **Backup**: Verifikasi automated backup berjalan

**Link**: Neon dashboard atau Supabase dashboard

### 3. Vercel Blob Storage
- **Storage Usage**: Monitor file upload volume
- **Bandwidth**: Track download traffic
- **File Count**: Jumlah file yang tersimpan

**Link**: Vercel dashboard > Storage > Blob

### 4. Resend Email
- **Email Delivery**: Monitor sent, delivered, bounced, complained
- **Domain Health**: Cek DKIM, SPF, DMARC status
- **API Usage**: Track email API calls

**Link**: https://resend.com/dashboard

### 5. Web Vitals
- **LCP (Largest Contentful Paint)**: Target ≤ 2.5s
- **INP (Interaction to Next Paint)**: Target ≤ 200ms
- **CLS (Cumulative Layout Shift)**: Target ≤ 0.1

**Check**: Chrome DevTools > Lighthouse, atau Vercel Analytics

## Maintenance

### Daily
- [ ] Check Vercel error tracking untuk critical errors
- [ ] Monitor cron job execution (`/api/cron/notifications`)
- [ ] Check email delivery rate di Resend

### Weekly
- [ ] Review database query performance
- [ ] Check storage usage growth (database + blob)
- [ ] Monitor Web Vitals trends
- [ ] Review user feedback dan support tickets

### Monthly
- [ ] Database backup verification
- [ ] Security audit (check for new vulnerabilities)
- [ ] Update dependencies (`npm audit`)
- [ ] Review analytics dan user behavior
- [ ] Capacity planning (database, storage, bandwidth)

## Common Issues dan Troubleshooting

### 1. Build Failed di Vercel
**Symptom**: Deployment failed, build error
**Fix**:
```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for missing environment variables
cat .env.example
```

### 2. Database Connection Failed
**Symptom**: "Failed query" error di logs
**Fix**:
- Verify `DATABASE_URL` di Vercel environment
- Check database is running di Neon/Supabase
- Verify network access (Vercel IP ranges)
- Check connection pool limits

### 3. Email Tidak Terkirim
**Symptom**: User tidak menerima email verification/password reset
**Fix**:
- Check Resend dashboard untuk email status
- Verify domain `sndwbites.net` sudah diverifikasi
- Check DNS records (DKIM, SPF, DMARC)
- Verify `RESEND_API_KEY` dan `MAIL_FROM` di Vercel

### 4. File Upload Failed
**Symptom**: Upload gallery/documents/contracts gagal
**Fix**:
- Verify `BLOB_READ_WRITE_TOKEN` di Vercel environment
- Check Vercel Blob storage quota
- Verify file size limit (50MB max)
- Check network connectivity

### 5. Cron Job Tidak Berjalan
**Symptom**: Notification tidak terkirim otomatis
**Fix**:
- Check Vercel cron job status di dashboard
- Verify `vercel.json` cron schedule
- Check `/api/cron/notifications` endpoint logs
- Verify `CRON_SECRET` di Vercel environment

### 6. Slow Page Load
**Symptom**: LCP > 2.5s, user complain slow
**Fix**:
- Check Web Vitals di Vercel Analytics
- Optimize images (use Next.js Image component)
- Check database query performance
- Enable caching untuk data fetching
- Review bundle size

## Scaling

### When to Scale
- **Database**: > 1000 concurrent users
- **Storage**: > 10GB blob storage
- **Bandwidth**: > 100GB/month

### How to Scale
1. **Database**: Upgrade Neon/Supabase plan, add read replicas
2. **Storage**: Monitor Vercel Blob, consider S3 untuk large files
3. **CDN**: Vercel sudah include CDN, no action needed
4. **Caching**: Implement Redis untuk session dan data cache
5. **Monitoring**: Setup Sentry untuk error tracking yang lebih advanced

## User Feedback

### Collect Feedback
- In-app feedback form (link ke support@sewaka.com)
- Google Reviews
- Social media (Instagram, TikTok)
- Email support

### Prioritize Features
1. **Bug fixes** — P0, fix immediately
2. **User requests** — P1, plan for next sprint
3. **Nice to have** — P2, backlog

## Rollback Procedure

### If Something Goes Wrong
1. **Identify the issue** — Check Vercel logs, error tracking
2. **Assess impact** — How many users affected?
3. **Rollback** — Vercel dashboard > Deployments > Click previous deployment > "Produce"
4. **Communicate** — Notify users via email/social media
5. **Fix and redeploy** — Fix the issue, test locally, deploy again

### Database Rollback
```sql
-- If migration caused issues, rollback
-- Check migration history
SELECT * FROM drizzle_migrations ORDER BY id DESC;

-- Manual rollback if needed
-- (Drizzle doesn't support automatic rollback)
-- Write reverse migration and apply
```

## Contact

- **Support**: support@sewaka.com
- **Developer**: Check GitHub issues
- **Emergency**: Contact project owner directly
