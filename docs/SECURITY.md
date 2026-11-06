# Security Audit & Penetration Testing Guide — Sewaka

## Executive Summary

Sewaka telah melalui security audit internal untuk mempersiapkan penetration testing. Dokumen ini berisi:
1. **Security Architecture** — Arsitektur keamanan yang sudah diimplementasikan
2. **Vulnerability Assessment** — Kerentanan yang ditemukan dan status perbaikan
3. **Pentest Checklist** — Checklist untuk penetration tester
4. **Remediation Plan** — Rencana perbaikan untuk kerentanan yang tersisa

**Last updated: 2026-11-05**

---

## 1. Security Architecture

### 1.1 Authentication & Authorization

| Component | Implementation | Status |
|-----------|---------------|--------|
| Session Management | NextAuth JWT, 14-day max age | ✅ |
| Password Hashing | bcryptjs, cost factor 12 | ✅ |
| Social Login | Google OAuth via NextAuth | ✅ |
| Admin RBAC | Role-based access control | ✅ |
| Route Protection | Server-side auth checks | ✅ |
| Rate Limiting | In-memory, per-IP (login, register, password reset, email verification) | ✅ |
| Cookie Security | __Secure/__Host prefixes, httpOnly, sameSite, secure flags | ✅ |

### 1.2 Input Validation

| Component | Implementation | Status |
|-----------|---------------|--------|
| Form Validation | Zod schemas | ✅ |
| Server Actions | Input sanitization via Zod | ✅ |
| File Upload | Type + size validation (50MB max), filename sanitization | ✅ |
| CSV Import | HTML stripping, email validation | ✅ |
| SQL Injection | Drizzle ORM parameterized queries | ✅ |
| XSS Prevention | React auto-escaping + stripHtml utility | ✅ |
| Path Traversal | Filename sanitization in `lib/sanitization.ts` | ✅ |

### 1.3 API Security

| Component | Implementation | Status |
|-----------|---------------|--------|
| Rate Limiting | Login, register, checkout, webhook, check-in, password reset, email verification | ✅ |
| Webhook Signature | HMAC-SHA512 verification | ✅ |
| CORS | Explicit allowlist with `ALLOWED_ORIGINS` env var | ✅ |
| CSRF | NextAuth built-in + __Host cookie prefix | ✅ |
| Request Size Limit | 10MB default, 50MB for upload routes | ✅ |

### 1.4 Data Protection

| Component | Implementation | Status |
|-----------|---------------|--------|
| Database SSL | Production: required | ✅ |
| Connection Pool | Timeout + idle management | ✅ |
| Secrets Management | Environment variables | ✅ |
| .gitignore | 13 categories, comprehensive | ✅ |
| Structured Logging | Sensitive data masking, NODE_ENV aware | ✅ |

### 1.5 Network Security

| Component | Implementation | Status |
|-----------|---------------|--------|
| Security Headers | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection | ✅ |
| Content Security Policy | Strict CSP with allowlists | ✅ |
| HSTS | Production only, 1 year, includeSubDomains, preload | ✅ |
| Permissions Policy | Camera, mic, geo restricted | ✅ |
| Admin IP Whitelist | Optional via `ADMIN_IP_WHITELIST` env var | ✅ |

---

## 2. Vulnerability Assessment

### 2.1 Critical (Must Fix Before Pentest)

| ID | Vulnerability | Impact | Status | Fix |
|----|--------------|--------|--------|-----|
| VULN-001 | Webhook signature not verified | Payment fraud | ✅ Fixed | HMAC-SHA512 verification di `subscription-actions.ts` |
| VULN-002 | No security headers | XSS, clickjacking | ✅ Fixed | `middleware.ts` dengan HSTS, CSP, X-Frame-Options |
| VULN-003 | No rate limiting on login | Brute force attack | ✅ Fixed | 5 attempts/minute per IP di `auth-actions.ts` |
| VULN-004 | No rate limiting on registration | Account creation abuse | ✅ Fixed | 3 attempts/hour per IP di `auth-actions.ts` |

### 2.2 High (Should Fix Before Pentest)

| ID | Vulnerability | Impact | Status | Fix |
|----|--------------|--------|--------|-----|
| VULN-005 | Rate limiting in-memory only | Bypass on multi-instance | ⚠️ Known | Gunakan Vercel KV/Redis untuk production |
| VULN-006 | No CORS explicit configuration | Cross-origin abuse | ✅ Fixed | CORS middleware dengan allowlist di `middleware.ts` |
| VULN-007 | Console.log in production | Information leakage | ✅ Fixed | Structured logging di `lib/logger.ts` dengan sensitive data masking |
| VULN-008 | No request size limit | DoS via large payload | ✅ Fixed | 10MB default, 50MB upload routes di `middleware.ts` |

### 2.3 Medium (Acceptable Risk)

| ID | Vulnerability | Impact | Status | Fix |
|----|--------------|--------|--------|-----|
| VULN-009 | CSP allows 'unsafe-inline' | XSS if other vuln exists | ⚠️ Known | Next.js requirement, acceptable |
| VULN-010 | No email rate limiting | Email spam | ✅ Fixed | 3 requests/hour per IP di password reset dan email verification |
| VULN-011 | Error messages reveal info | User enumeration | ✅ Fixed | Generic error messages + silent success di email verification |
| VULN-012 | No IP whitelist for admin | Admin access from any IP | ✅ Fixed | `ADMIN_IP_WHITELIST` env var di `middleware.ts` |
| VULN-014 | No cookie SameSite explicit | CSRF | ✅ Fixed | __Secure/__Host prefixes + sameSite: lax di `auth.ts` |

### 2.4 Low (Informational)

| ID | Vulnerability | Impact | Status |
|----|--------------|--------|--------|
| VULN-013 | No Subresource Integrity | Script injection via CDN | Info |
| VULN-015 | Service worker scope too broad | Cache manipulation | Info |

---

## 3. Pentest Checklist

### 3.1 Authentication Testing

- [ ] **Brute force login** — Test rate limiting (5 attempts/minute)
- [ ] **Password reset abuse** — Test email flooding
- [ ] **Session hijacking** — Test JWT token manipulation
- [ ] **OAuth bypass** — Test Google OAuth flow
- [ ] **Account enumeration** — Test error messages for user existence
- [ ] **Password policy** — Test weak password acceptance
- [ ] **Session fixation** — Test session token rotation

### 3.2 Authorization Testing

- [ ] **IDOR (Insecure Direct Object Reference)** — Test accessing other users' data via UUID manipulation
- [ ] **Privilege escalation** — Test non-admin accessing /admin/*
- [ ] **Workspace isolation** — Test accessing other workspaces
- [ ] **Role bypass** — Test role manipulation in requests
- [ ] **API authorization** — Test API routes without auth

### 3.3 Input Validation Testing

- [ ] **SQL Injection** — Test all input fields (Drizzle ORM should prevent)
- [ ] **XSS (Cross-Site Scripting)** — Test reflected, stored, DOM-based XSS
- [ ] **CSRF (Cross-Site Request Forgery)** — Test form submissions
- [ ] **File upload** — Test malicious file types, size limits
- [ ] **CSV injection** — Test guest import with malicious CSV
- [ ] **Command injection** — Test system command injection
- [ ] **Path traversal** — Test file path manipulation

### 3.4 API Security Testing

- [ ] **Webhook tampering** — Test Midtrans webhook signature bypass
- [ ] **Rate limiting bypass** — Test rate limit evasion techniques
- [ ] **API enumeration** — Test discovering hidden endpoints
- [ ] **Mass assignment** — Test adding extra fields to requests
- [ ] **Business logic** — Test payment flow manipulation

### 3.5 Infrastructure Testing

- [ ] **SSL/TLS** — Test certificate, protocol versions, cipher suites
- [ ] **HTTP headers** — Verify security headers present
- [ ] **CORS** — Test cross-origin requests
- [ ] **DNS** — Test DNS configuration and records
- [ ] **Subdomain takeover** — Test unused subdomains

### 3.6 Data Protection Testing

- [ ] **Database access** — Test direct database access
- [ ] **Data leakage** — Test error messages for sensitive data
- [ ] **Logging** — Verify no sensitive data in logs
- [ ] **Backup security** — Test backup file access
- [ ] **Environment variables** — Test .env exposure

### 3.7 Client-Side Testing

- [ ] **DOM XSS** — Test client-side injection
- [ ] **LocalStorage** — Test sensitive data in browser storage
- [ ] **Service Worker** — Test SW manipulation
- [ ] **PWA** — Test PWA installation and behavior
- [ ] **JavaScript** — Test client-side logic bypass

---

## 4. Security Headers Reference

All security headers are now set via `middleware.ts`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (production only)
Content-Security-Policy: [see middleware.ts for full policy]
```

---

## 5. Rate Limiting Reference

| Endpoint | Limit | Window | Implementation |
|----------|-------|--------|----------------|
| Login | 5 attempts | 1 minute | `auth-actions.ts` |
| Registration | 3 attempts | 1 hour | `auth-actions.ts` |
| Password Reset | 3 requests | 1 hour | `password-actions.ts` |
| Email Verification | 3 requests | 1 hour | `email-verification-actions.ts` |
| Subscription checkout | 5 requests | 1 minute | `checkout/route.ts` |
| Payment webhook | 30 requests | 1 minute | `webhook/route.ts` |
| Guest check-in | 20 requests | 1 minute | `check-in/route.ts` |

---

## 6. Known Limitations

1. **Rate limiting is in-memory** — In multi-instance deployments (Vercel), rate limits are per-instance, not global. For production, consider Vercel KV or Redis.

2. **CSP allows 'unsafe-inline'** — Required by Next.js for client-side rendering. This is an acceptable trade-off.

3. **No Subresource Integrity** — No SRI attributes on external scripts. Low risk since no third-party scripts are loaded.

4. **Service worker scope too broad** — The service worker caches all routes. Consider narrowing the scope for production.

---

## 7. Remediation Priority

### Before Pentest (Critical) — ✅ ALL DONE
- ✅ VULN-001: Webhook signature verification
- ✅ VULN-002: Security headers
- ✅ VULN-003: Login rate limiting
- ✅ VULN-004: Registration rate limiting

### Before Production (High) — ✅ ALL DONE
- ✅ VULN-006: CORS explicit configuration
- ✅ VULN-007: Structured logging with sensitive data masking
- ✅ VULN-008: Request size limit
- ⚠️ VULN-005: In-memory rate limiter (acceptable for single-instance, use Vercel KV for multi-instance)

### Before Production (Medium) — ✅ ALL DONE
- ✅ VULN-010: Email rate limiting
- ✅ VULN-011: Generic error messages + user enumeration prevention
- ✅ VULN-012: Admin IP whitelist
- ✅ VULN-014: Cookie security (__Secure/__Host prefixes)

### Post-Production (Low)
- [ ] VULN-013: Subresource Integrity for external scripts
- [ ] VULN-015: Narrow service worker scope

---

## 8. Emergency Contacts

If a critical vulnerability is found during pentest:

1. **Stop testing immediately**
2. **Document the vulnerability** with proof-of-concept
3. **Contact the development team** via support@sewaka.com
4. **Do not exploit further** without authorization

---

## 9. Testing Environment

For pentest, use the following sandbox credentials:

- **Midtrans Sandbox:** `SB-Mid-server-*` (configured in .env)
- **Resend Testing:** `onboarding@resend.dev` (before domain verification)
- **Database:** Development database (NOT production)

**Important:** Pentest should be conducted on a staging environment, NOT on production.

---

## 10. Compliance Notes

- **OWASP Top 10 2021:** All categories addressed
- **GDPR:** Data anonymization on account deactivation
- **PCI DSS:** Payment handled by Midtrans (SAAS Level 1 certified)
- **Indonesia PDP Law:** User consent and data minimization implemented

---

*Last updated: 2026-11-05*
*Next review: After pentest completion*
