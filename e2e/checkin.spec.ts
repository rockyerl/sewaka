import { test, expect } from '@playwright/test';

test('check-in page requires an invitation code before submission', async ({ page }) => {
  await page.goto('/check-in');
  await expect(page.getByPlaceholder('Contoh: SWK-ABC123')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check-In Sekarang' })).toBeDisabled();
});

test('check-in API validates required form fields', async ({ request }) => {
  const response = await request.post('/api/v1/guests/check-in', { multipart: {} });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: 'Workspace ID dan invitation code diperlukan' });
});

test('batch check-in API validates its payload', async ({ request }) => {
  const response = await request.post('/api/v1/guests/check-in/batch', { data: {} });
  expect(response.status()).toBe(400);
});
