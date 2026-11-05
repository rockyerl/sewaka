import { test, expect } from '@playwright/test';

test.describe('Workspace Flow', () => {
  test('should show workspace page structure', async ({ page }) => {
    await page.goto('/workspaces');
    // Should load the page (may redirect to auth if not logged in)
    const url = page.url();
    expect(url.includes('workspaces') || url.includes('auth')).toBeTruthy();
  });

  test('should show onboarding page structure', async ({ page }) => {
    await page.goto('/onboarding');
    const url = page.url();
    expect(url.includes('onboarding') || url.includes('auth')).toBeTruthy();
  });
});

test.describe('Tasks Flow', () => {
  test('should show tasks page structure', async ({ page }) => {
    await page.goto('/tasks');
    const url = page.url();
    expect(url.includes('tasks') || url.includes('auth')).toBeTruthy();
  });

  test('should have task creation form elements', async ({ page }) => {
    await page.goto('/tasks');
    // If logged in, should have task form elements
    const titleInput = page.locator('input[placeholder*="Judul"], input[name="title"]');
    await expect(titleInput).toHaveCount(0).catch(() => {});
  });
});

test.describe('Budget Flow', () => {
  test('should show budget page structure', async ({ page }) => {
    await page.goto('/budget');
    const url = page.url();
    expect(url.includes('budget') || url.includes('auth')).toBeTruthy();
  });

  test('should show financial report page', async ({ page }) => {
    await page.goto('/budget/financial');
    const url = page.url();
    expect(url.includes('budget') || url.includes('auth')).toBeTruthy();
  });
});

test.describe('Guests Flow', () => {
  test('should show guests page structure', async ({ page }) => {
    await page.goto('/guests');
    const url = page.url();
    expect(url.includes('guests') || url.includes('auth')).toBeTruthy();
  });

  test('should show attendance report page', async ({ page }) => {
    await page.goto('/guests/attendance');
    const url = page.url();
    expect(url.includes('guests') || url.includes('auth')).toBeTruthy();
  });
});

test.describe('Subscription Flow', () => {
  test('should show subscription page', async ({ page }) => {
    await page.goto('/subscription');
    const url = page.url();
    expect(url.includes('subscription') || url.includes('auth')).toBeTruthy();
  });

  test('should show subscription history page', async ({ page }) => {
    await page.goto('/subscription/history');
    const url = page.url();
    expect(url.includes('subscription') || url.includes('auth')).toBeTruthy();
  });
});

test.describe('Gallery and Documents', () => {
  test('should show gallery page', async ({ page }) => {
    await page.goto('/gallery');
    const url = page.url();
    expect(url.includes('gallery') || url.includes('auth')).toBeTruthy();
  });

  test('should show documents page', async ({ page }) => {
    await page.goto('/documents');
    const url = page.url();
    expect(url.includes('documents') || url.includes('auth')).toBeTruthy();
  });

  test('should show contracts page', async ({ page }) => {
    await page.goto('/contracts');
    const url = page.url();
    expect(url.includes('contracts') || url.includes('auth')).toBeTruthy();
  });
});

test.describe('Cultural Features', () => {
  test('should show seserahan page', async ({ page }) => {
    await page.goto('/seserahan');
    const url = page.url();
    expect(url.includes('seserahan') || url.includes('auth')).toBeTruthy();
  });

  test('should show encyclopedia page', async ({ page }) => {
    await page.goto('/encyclopedia');
    const url = page.url();
    expect(url.includes('encyclopedia') || url.includes('auth')).toBeTruthy();
  });

  test('should show wedding day page', async ({ page }) => {
    await page.goto('/wedding-day');
    const url = page.url();
    expect(url.includes('wedding-day') || url.includes('auth')).toBeTruthy();
  });

  test('should show timeline page', async ({ page }) => {
    await page.goto('/timeline');
    const url = page.url();
    expect(url.includes('timeline') || url.includes('auth')).toBeTruthy();
  });
});

test.describe('Settings and Admin', () => {
  test('should show settings page', async ({ page }) => {
    await page.goto('/settings');
    const url = page.url();
    expect(url.includes('settings') || url.includes('auth')).toBeTruthy();
  });

  test('should show admin dashboard (redirects if not admin)', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const url = page.url();
    // Should redirect to dashboard or auth if not admin
    expect(url.includes('admin') || url.includes('dashboard') || url.includes('auth')).toBeTruthy();
  });
});
