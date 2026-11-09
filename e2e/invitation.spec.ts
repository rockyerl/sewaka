import { test, expect } from '@playwright/test';

test('invitation entry page explains how to open an invitation', async ({ page }) => {
  await page.goto('/invitation');
  await expect(page).toHaveTitle(/Sewaka/i);
  await expect(page.getByText(/Contoh:/i)).toBeVisible();
  await expect(page.getByText(/nama-undangan/i)).toBeVisible();
});
