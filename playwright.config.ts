import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.E2E_DATABASE_URL || process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  webServer: [
    {
      command: 'node scripts/google-calendar-mock-server.mjs',
      url: 'http://127.0.0.1:43129/__health',
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    {
      command: 'node node_modules/next/dist/bin/next dev --port 3100',
      url: 'http://localhost:3100',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        DATABASE_URL: process.env.E2E_DATABASE_URL ?? 'postgres://disabled:disabled@127.0.0.1/disabled',
        AUTH_URL: 'http://localhost:3100',
        NEXT_DIST_DIR: '.next-e2e',
        UPSTASH_REDIS_URL: '',
        UPSTASH_REDIS_TOKEN: '',
        GOOGLE_CALENDAR_OAUTH_BASE_URL: 'http://127.0.0.1:43129',
        GOOGLE_CALENDAR_API_BASE_URL: 'http://127.0.0.1:43129/calendar/v3/',
      },
    },
  ],
});
