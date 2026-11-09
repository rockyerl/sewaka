---
sessionId: session-261109-080100-perf
---

# Performance Audit Plan

### Overview
Audit dan optimasi performa project Sewaka web, fokus pada halaman undangan public yang diakses tamu tanpa login. Target: Lighthouse score 90+ untuk Performance, Accessibility, Best Practices, dan SEO.

### Areas to Audit
1. **Bundle Analysis** — Identifikasi bundle size yang bisa dioptimasi
2. **Image Optimization** — Ganti `<img>` dengan Next.js `<Image>` component
3. **Caching Strategy** — Tambah cache headers untuk API routes dan static assets
4. **SEO Optimization** — Open Graph, Twitter Cards, structured data untuk invitation pages
5. **Lighthouse Audit** — Run actual Lighthouse audit dan fix issues

### Current State
- Next.js 16.4.5 dengan Turbopack
- 30 feature modules di `features/` directory
- Web vitals monitoring sudah ada (`web-vitals` package)
- Service worker sudah ada (`ServiceWorkerRegister`)
- Metadata dasar sudah ada di `app/layout.tsx`
- Invitation page sudah ada dynamic metadata

### Performance Issues Identified
1. **QR Code library** — `qrcode` package diimport di client component, menambah bundle size
2. **Image tags** — Beberapa `<img>` tag tanpa lazy loading atau proper sizing
3. **No API caching** — API routes tanpa cache headers
4. **Missing Open Graph images** — Invitation pages tidak punya dynamic OG image
5. **No structured data** — Tidak ada JSON-LD untuk wedding event
6. **Font loading** — Google Fonts di-load via dangerouslySetInnerHTML, bukan next/font

# Technical Design

### Bundle Optimization
- Dynamic import untuk `qrcode` library (hanya saat perlu generate QR)
- Code splitting untuk heavy components (HeroCarousel, StoryTimeline)
- Tree shaking untuk unused exports

### Image Optimization
- Ganti `<img>` dengan Next.js `<Image>` component
- Add proper `sizes` dan `priority` attributes
- Lazy load untuk images di bawah fold

### Caching Strategy
- API routes: `export const revalidate = 3600` untuk public invitation data
- Static assets: Cache-Control headers via next.config.ts
- Font caching: Preconnect dan prefetch untuk Google Fonts

### SEO Optimization
- Dynamic Open Graph image generation untuk invitation pages
- JSON-LD structured data untuk WeddingEvent
- Twitter Cards metadata
- Canonical URLs

### Lighthouse Targets
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

# Delivery Steps

### ✓ Step 1: Bundle Analysis & Code Splitting
Analisis bundle size dan implementasi code splitting untuk heavy components.
- Dynamic import `qrcode` library di public-invitation-view.tsx
- Code splitting untuk HeroCarousel, StoryTimeline, LoveAnimation
- Tambah webpack bundle analyzer untuk monitoring

### ✓ Step 2: Image Optimization
Ganti semua `<img>` tag dengan Next.js `<Image>` component.
- Public invitation view: couple photo, hero carousel, story timeline photos
- Admin pages: vendor photos, gallery images
- Add proper `sizes`, `priority`, dan `loading` attributes

### ✓ Step 3: Caching Strategy
Implementasi caching headers untuk API routes dan static assets.
- Public invitation API: revalidate 3600 seconds
- Next.config.ts: cache headers untuk static assets
- Font caching: preconnect dan prefetch

### ✓ Step 4: SEO Optimization
Tambah Open Graph, Twitter Cards, dan structured data untuk invitation pages.
- Dynamic OG image generation menggunakan `ImageResponse`
- JSON-LD structured data untuk WeddingEvent
- Twitter Cards metadata
- Canonical URLs

### ✓ Step 5: Lighthouse Audit & Verification
Run Lighthouse audit dan verifikasi semua improvements.
- Build production dan run Lighthouse
- Fix any remaining issues
- Update documentation dengan performance metrics
