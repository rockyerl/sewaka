import { test, expect } from '@playwright/test';

test('unknown invitation slug returns the not-found page', async ({ page }) => {
  const response = await page.goto('/invitation/sewaka-e2e-missing-slug');
  expect(response?.status()).toBeLessThan(500);
  await expect(page).toHaveTitle(/Undangan Pernikahan Tidak Ditemukan - Sewaka/i);
});
