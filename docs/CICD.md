# CI/CD Pipeline — Sewaka

## Overview

Sewaka menggunakan **GitHub Actions** sebagai CI/CD pipeline untuk automated testing, code quality checks, dan deployment ke Vercel.

## Workflows

### 1. CI (`.github/workflows/ci.yml`)

**Trigger:** Push ke `main`/`develop`, Pull Request ke `main`

**Jobs:**
- **Lint & TypeCheck** — ESLint + TypeScript type checking
- **Build** — Next.js production build
- **Unit Tests** — Node.js test runner untuk auth, RLS, curated vendors, seserahan
- **E2E Tests** — Playwright end-to-end tests dengan Chromium

**Pipeline:**
```
Push/PR → Lint & TypeCheck → Build → Unit Tests → E2E Tests
                                    ↓
                              (parallel)
```

### 2. Deploy (`.github/workflows/deploy.yml`)

**Trigger:** Push ke `main`

**Jobs:**
- **Deploy to Vercel** — Build, deploy, run migrations, verify health check

**Pipeline:**
```
Push to main → Build → Deploy to Vercel → Run Migrations → Health Check
```

### 3. Code Quality (`.github/workflows/code-quality.yml`)

**Trigger:** Push ke `main`/`develop`, Pull Request ke `main`

**Jobs:**
- **Security Audit** — npm audit + TruffleHog untuk detect secrets
- **Dependencies Check** — npm outdated + package-lock consistency
- **Code Style** — ESLint + TypeScript type checking

## GitHub Secrets

Setelah setup, set secrets berikut di **GitHub > Settings > Secrets and variables > Actions**:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `DATABASE_URL` | Production database URL | CI, Deploy, E2E |
| `MIGRATION_DATABASE_URL` | Database URL untuk migrations | Deploy |
| `AUTH_SECRET` | NextAuth secret | CI, Deploy, E2E |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | Deploy |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Deploy |
| `RESEND_API_KEY` | Resend email API key | Deploy, E2E |
| `MAIL_FROM` | Email sender address | Deploy, E2E |
| `MIDTRANS_SERVER_KEY` | Midtrans server key | Deploy |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key | Deploy |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans client key (public) | Deploy |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Deploy |
| `CRON_SECRET` | Cron job secret | Deploy |
| `VERCEL_TOKEN` | Vercel API token | Deploy |
| `VERCEL_ORG_ID` | Vercel organization ID | Deploy |
| `VERCEL_PROJECT_ID` | Vercel project ID | Deploy |
| `VERCEL_DOMAIN` | Production domain | Deploy |

### Setup Vercel Token

1. Login ke [Vercel Dashboard](https://vercel.com/account/tokens)
2. Create new token
3. Copy token ke GitHub secrets sebagai `VERCEL_TOKEN`
4. Copy Organization ID dan Project ID dari Vercel dashboard

## Branch Protection Rules

Setup branch protection di **GitHub > Settings > Branches**:

### `main` branch
- [x] Require pull request reviews before merging
- [x] Require status checks to pass before merging
  - Lint & TypeCheck
  - Build
  - Unit Tests
  - E2E Tests
- [x] Require branches to be up to date before merging
- [x] Include administrators

### `develop` branch
- [x] Require pull request reviews before merging
- [x] Require status checks to pass before merging
  - Lint & TypeCheck
  - Build

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/nama-fitur
```

### 2. Make Changes
```bash
# Edit code
# Add tests
# Update documentation
```

### 3. Pre-commit Checks
```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build

# Unit tests
npm test

# E2E tests (optional, slow)
npx playwright test
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/nama-fitur
```

### 5. Create Pull Request
- Go to GitHub repository
- Click "Compare & pull request"
- Fill PR template
- Wait for CI to pass
- Request review

### 6. Merge to Main
- After approval, merge PR
- CI will automatically deploy to Vercel

## Local Development

### Run All Checks Locally
```bash
# Full CI pipeline locally
npm run lint && \
npm run typecheck && \
npm run build && \
npm test
```

### Run E2E Tests Locally
```bash
# Start dev server in one terminal
npm run dev

# In another terminal, run E2E tests
npx playwright test
```

## Monitoring

### GitHub Actions Dashboard
- View workflow runs: **GitHub > Actions**
- View specific workflow: Click workflow name
- View logs: Click job name

### Vercel Dashboard
- View deployments: **Vercel > Project > Deployments**
- View analytics: **Vercel > Project > Analytics**
- View cron jobs: **Vercel > Project > Settings > Cron Jobs**

## Troubleshooting

### CI Fails
1. Check GitHub Actions logs
2. Run checks locally: `npm run lint`, `npm run typecheck`, `npm run build`
3. Fix errors and push again

### Deploy Fails
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check database connectivity
4. Verify migrations run successfully

### E2E Tests Fail
1. Check Playwright report artifact
2. Run tests locally: `npx playwright test`
3. Check if dev server is running
4. Verify database has test data

### Secrets Not Working
1. Verify secrets are set in GitHub > Settings > Secrets
2. Check secret names match exactly (case-sensitive)
3. Re-run workflow after adding secrets

## Performance

### Cache Dependencies
GitHub Actions caches `node_modules` using npm cache key untuk speed up builds.

### Parallel Jobs
- Lint, typecheck, build, dan tests berjalan parallel
- E2E tests menunggu build selesai

### Estimated Build Times
- Lint & TypeCheck: ~30 seconds
- Build: ~60 seconds
- Unit Tests: ~15 seconds
- E2E Tests: ~2 minutes
- Deploy: ~2 minutes

## Security

### Secret Scanning
TruffleHog secara otomatis scan untuk secrets di code. Jika detected, workflow akan fail.

### Dependency Audit
npm audit secara otomatis check untuk known vulnerabilities.

### Code Review
Semua PR harus di-review sebelum merge ke `main`.

## Rollback

### Vercel Rollback
1. Go to **Vercel > Project > Deployments**
2. Click on previous successful deployment
3. Click "Promote to Production"

### Git Rollback
```bash
# Revert last commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

## Best Practices

1. **Small PRs** — Keep PRs small and focused
2. **Test Coverage** — Add tests for new features
3. **Code Review** — Review PRs thoroughly
4. **CI First** — Let CI run before merging
5. **Monitor** — Check CI/CD logs regularly
6. **Update Dependencies** — Regularly update npm packages
7. **Document** — Update documentation with changes

## Next Steps

1. Setup GitHub secrets (lihat tabel di atas)
2. Setup branch protection rules
3. Test CI/CD pipeline dengan push ke `develop`
4. Monitor first deployment
5. Setup Vercel Analytics dan Error Tracking
