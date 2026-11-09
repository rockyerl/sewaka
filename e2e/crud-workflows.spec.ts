import { test, expect } from "@playwright/test";
import { signInE2EAccount } from "./helpers";

test.setTimeout(180_000);

test("authenticated task, guest, event, and calendar workflows complete CRUD and sync", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The shared test calendar mock runs once to keep CRUD state isolated.");
  const account = await signInE2EAccount(page);

  await test.step("task create, read, status update, and delete", async () => {
    await page.goto("/tasks");
    await page.getByRole("button", { name: "Tampilkan" }).click();
    await page.getByRole("button", { name: "Tambah Tugas" }).first().click();
    const title = `E2E task ${Date.now()}`;
    await page.getByPlaceholder("Contoh: Booking fotografer pernikahan").fill(title);
    await page.locator('input[name="dueDate"]').fill(new Date().toISOString().slice(0, 10));
    await page.getByRole("button", { name: "Tambah Tugas" }).last().click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.getByRole("button", { name: `Tandai selesai: ${title}` }).click();
    await expect(page.getByRole("button", { name: `Tandai belum selesai: ${title}` })).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: `Hapus tugas ${title}` }).click({ force: true });
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
  });

  await test.step("guest create, read, and delete", async () => {
    await page.goto("/guests");
    const guestName = `E2E guest ${Date.now()}`;
    await page.getByPlaceholder("Nama tamu lengkap").fill(guestName);
    await page.getByRole("button", { name: "Tambah Tamu" }).click();
    const guestRow = page.getByRole("row").filter({ hasText: guestName });
    await expect(guestRow).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await guestRow.getByRole("button", { name: "Hapus tamu" }).click();
    await expect(page.getByRole("row").filter({ hasText: guestName })).toHaveCount(0);
  });

  const eventTitle = `E2E calendar event ${Date.now()}`;
  await test.step("event create and delete", async () => {
    await page.goto("/events");
    await page.getByRole("button", { name: "Tambah Acara" }).click();
    const eventForm = page.locator("form").filter({ has: page.getByPlaceholder("cth: Akad Nikah Khidmat") });
    await eventForm.getByPlaceholder("cth: Akad Nikah Khidmat").fill(eventTitle);
    await eventForm.getByPlaceholder("cth: Masjid Agung / Sasana Handrawina").fill("E2E Venue");
    await eventForm.getByRole("button", { name: "Simpan Acara" }).click();
    await expect(eventForm).toHaveCount(0);
    await page.reload();
    await expect(page.getByText(eventTitle, { exact: true }).first()).toBeVisible();
  });

  await test.step("Google OAuth, calendar upsert, and deleted-event propagation", async () => {
    await page.route("https://accounts.google.com/o/oauth2/v2/auth**", async (route) => {
      const authorizeUrl = new URL(route.request().url());
      const callbackUrl = new URL(authorizeUrl.searchParams.get("redirect_uri")!);
      callbackUrl.searchParams.set("state", authorizeUrl.searchParams.get("state")!);
      callbackUrl.searchParams.set("code", "e2e-google-authorization-code");
      await route.fulfill({ status: 302, headers: { location: callbackUrl.toString() } });
    });

    await page.goto("/settings");
    await page.getByRole("button", { name: "Hubungkan Google Calendar" }).click();
    await expect(page.getByText("Terhubung ke Google Calendar")).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Sinkronkan Sekarang" }).click();
    await expect(page.getByText(/Berhasil menyinkronkan/)).toBeVisible();
    await expect.poll(async () => (await (await request.get("http://127.0.0.1:43129/__stats")).json()).insert).toBe(2);

    await page.getByRole("button", { name: "Sinkronkan Sekarang" }).click();
    await expect(page.getByText(/Berhasil menyinkronkan/)).toBeVisible();
    await expect.poll(async () => (await (await request.get("http://127.0.0.1:43129/__stats")).json()).update).toBe(2);

    await page.goto("/events");
    const eventItem = page.getByText(eventTitle, { exact: true }).last().locator("xpath=ancestor::div[contains(@class, 'rounded-xl')][1]");
    page.once("dialog", (dialog) => dialog.accept());
    await eventItem.getByRole("button", { name: "Hapus acara" }).click();
    await page.reload();
    await expect(page.getByText(eventTitle, { exact: true })).toHaveCount(0);

    await page.goto("/settings");
    await page.getByRole("button", { name: "Sinkronkan Sekarang" }).click();
    await expect(page.getByText(/Berhasil menyinkronkan/)).toBeVisible();
    await expect.poll(async () => (await (await request.get("http://127.0.0.1:43129/__stats")).json()).delete).toBe(1);

    await page.getByRole("button", { name: "Putuskan Hubungan" }).click();
    await expect(page.getByText("Tidak terhubung", { exact: true }).first()).toBeVisible();
    await expect.poll(async () => (await (await request.get("http://127.0.0.1:43129/__stats")).json()).revoke).toBe(1);
  });

  expect(account.workspaceId).toBeTruthy();
});
