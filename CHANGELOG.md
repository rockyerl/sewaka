# Changelog

All notable changes to the Sewaka project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Ready for Production
- All PRD features implemented (P0, P1, P2)
- 50+ pages compiled successfully
- 44+ action files, 22+ UI components, 28+ database tables

### Added
- **Premium Invitation Features**: Complete suite of digital invitation enhancements inspired by Attari
  - **Cover Page Animation**: Full-screen "Buka Undangan" cover with guest name personalization and auto-play music
  - **Love Story Timeline**: Visual timeline with milestones (date, title, description, photo) replacing plain text story
  - **Hero Photo Carousel**: Multiple hero photos with auto-slide (5s) and dots navigation
  - **Custom Font & Background**: 5 Google Fonts choices (Playfair Display, Great Vibes, etc.) and custom background image
  - **Love Animation**: Floating hearts CSS animation on scroll, toggleable via admin
  - **Event Countdown**: Real-time countdown per event, highlighting the nearest upcoming event
  - **Cashless Gift (Kado Digital)**: Multiple gift accounts (bank/e-wallet) with copy-to-clipboard
  - **Video Gallery**: YouTube embed for couple's video memories
  - **Live Streaming**: External live stream link section
  - **Share WhatsApp**: Personalized WhatsApp share button with template messages
  - **Bulk WhatsApp Invite**: Mass invitation via WhatsApp from admin (max 50/batch, rate limited)
- **PWA Support**: Manifest, service worker, offline support, installable on mobile/desktop
- **Web Vitals Monitoring**: LCP, INP, CLS tracking with `web-vitals` library
- **E2E Testing**: Playwright tests for auth, UI, and all major flows (18 test cases)
- **Cloud Storage**: Vercel Blob integration for file uploads (gallery, documents, contracts)
- **QR Code Generator**: Real QR code generation using `qrcode` library
- **Cron Job**: Notification scheduler endpoint with hourly schedule
- **Email Templates**: 5 HTML templates (verification, password reset, task reminder, budget alert, event reminder)
- **Admin RBAC**: Role-based access control for admin portal
- **Rate Limiting**: Protection for checkout, webhook, and check-in API routes
- **Image Optimization**: Next.js Image component for gallery and vendor portfolio
- **Data Caching**: In-memory cache with TTL for data fetching
- **Mobile Responsiveness**: Hamburger menu, mobile sidebar overlay, touch-friendly UI
- **Accessibility**: Skip navigation, ARIA labels, keyboard navigation (WCAG 2.1 AA)
- **SEO**: Sitemap.xml and robots.txt auto-generation
- **Health Check**: `/api/v1/health` endpoint for monitoring
- **Service Worker**: Cache-first for static assets, network-first for API calls
- **Offline Page**: Fallback page when offline
- **8 UI Components**: Skeleton, Select, Table, Dropdown Menu, Sheet, Tooltip, Accordion, Command
- **Bundle Optimization**: Removed unused recharts package (35 packages removed)

### Changed
- **Email Domain**: MAIL_FROM set to `noreply@sndwbites.net`
- **Database**: Added 16 new tables for feature support
- **Invitation Customization**: Extended with 8 new columns (`gift_accounts`, `video_url`, `live_stream_url`, `story_timeline`, `custom_font`, `background_image_url`, `hero_photo_urls`, `enable_animations`)
- **Public Invitation UI**: Complete redesign with cover page, timeline, carousel, animations, and countdown
- **Sidebar**: Updated to 16 menu items with complete navigation
- **Dashboard**: Added wedding countdown, quick actions, budget overview, tasks, events, guests, vendors

### Security
- **Rate Limiting**: 5/min for checkout, 30/min for webhook, 20/min for check-in
- **Bulk WhatsApp Rate Limit**: Max 50 guests per batch to prevent abuse
- **Admin RBAC**: Only users with `role = 'admin'` can access `/admin/*`
- **Environment Variables**: Comprehensive `.gitignore` with 13 categories
- **Input Validation**: Zod schemas for form validation
- **JSONB Sanitization**: All new JSONB fields (`story_timeline`, `hero_photo_urls`, `gift_accounts`) are sanitized with length limits on save

## [0.1.0] - 2024-11-05

### Initial Release
- Authentication (sign in, sign up, forgot password, email verification)
- Wedding workspace setup and onboarding wizard
- Task management with categories, templates, priority, status
- Budget and expense management with reports
- Vendor management with quotations and payments
- Guest management with RSVP, import/export, QR code
- Document management with upload and sharing
- Cultural features: Seserahan, Rundown, Encyclopedia
- Subscription and payment integration (Midtrans)
- Admin portal with user, workspace, plan management
- Notification system (email, push, WhatsApp)
- Calendar and timeline views
- Image gallery and vendor portfolio
- Contract management
- Comments system
- Settings and account management

[Unreleased]: https://github.com/sewaka/sewaka-web/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sewaka/sewaka-web/releases/tag/v0.1.0
