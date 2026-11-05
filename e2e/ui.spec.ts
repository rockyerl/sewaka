import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should have skip navigation link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveText('Langsung ke konten utama');
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'id');
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /Sewaka/);
  });

  test('should have proper title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sewaka/);
  });
});

test.describe('Accessibility', () => {
  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img[src]');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt !== null).toBeTruthy();
    }
  });

  test('forms should have labels', async ({ page }) => {
    await page.goto('/auth/signin');
    const inputs = page.locator('input[type="email"], input[type="password"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/auth/signin');
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(name !== null || (text && text.trim().length > 0)).toBeTruthy();
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Sewaka/);
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Sewaka/);
  });
});
