import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test.setTimeout(180_000);

test("admin can review dashboard and complete admin CRUD workflows", async ({ page, browser, browserName }) => {
  test.skip(browserName !== "chromium", "Admin route sweep runs once to avoid duplicate database-backed navigation.");

  const fixture = JSON.parse(readFileSync("test-results/.e2e-account.json", "utf8")) as {
    userId: string;
    settingKey: string;
    supportTicketId: string;
    email: string;
    password: string;
    adminAccount: { email: string; password: string; userId: string };
  };
  await page.goto("/auth/signin");
  await page.getByLabel("Email", { exact: true }).fill(fixture.adminAccount.email);
  await page.getByLabel("Password", { exact: true }).fill(fixture.adminAccount.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/admin/dashboard");
  await expect(page.getByRole("heading", { name: "Ringkasan Platform" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Penggunaan fitur" })).toBeVisible();
  await expect(page.getByText("Kalender terhubung", { exact: true })).toBeVisible();
  await expect(page.getByText("Tiket terbuka", { exact: true })).toBeVisible();

  const routes = [
    ["/admin/users", "Manajemen Pengguna"],
    ["/admin/workspaces", "Manajemen Workspace"],
    ["/admin/plans", "Paket Langganan"],
    ["/admin/payments", "Monitoring Pembayaran"],
    ["/admin/support", "Support Tickets"],
    ["/admin/content", "Content Management"],
    ["/admin/announcements", "Announcements"],
    ["/admin/feature-flags", "Feature Flags"],
    ["/admin/settings", "System Settings"],
    ["/admin/audit-trail", "Audit Trail"],
    ["/admin/logs", "System Logs"],
  ] as const;

  for (const [href, heading] of routes) {
    await page.goto(href);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }

  await page.goto("/admin/support");
  await page.getByRole("link", { name: "Detail" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/support/${fixture.supportTicketId}$`));
  await page.getByLabel("Status tiket").selectOption("IN_PROGRESS");
  await page.getByRole("button", { name: "Simpan status" }).click();
  await page.getByLabel("Balasan admin").fill("E2E internal review note");
  await page.getByLabel("Catatan internal (tidak terlihat oleh pengguna)").check();
  await page.getByRole("button", { name: "Kirim balasan" }).click();
  await expect(page.getByText("E2E internal review note")).toBeVisible();
  await expect(page.getByText("Catatan internal", { exact: true })).toBeVisible();

  await page.goto("/admin/users");
  await page.getByLabel("Cari pengguna").fill(fixture.adminAccount.email);
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page).toHaveURL(/search=e2e-admin-/);
  await expect(page.locator("main").getByText(fixture.adminAccount.email, { exact: true })).toBeVisible();

  await page.goto("/admin/payments");
  await page.getByLabel("Filter status pembayaran").selectOption("COMPLETED");
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await expect(page).toHaveURL(/status=COMPLETED/);

  await page.goto("/admin/plans");
  await page.getByRole("button", { name: "Tambah Paket" }).click();
  await page.getByLabel("Nama Paket *").fill("E2E Admin Plan");
  await page.getByLabel("Harga (angka)").fill("12345");
  await page.getByRole("button", { name: "Simpan Paket" }).click();
  await expect(page.getByText("E2E Admin Plan", { exact: true })).toBeVisible();
  const planCard = page.locator("[data-slot='card']").filter({ hasText: "E2E Admin Plan" });
  await planCard.getByRole("button").first().click();
  await page.getByLabel("Nama Paket *").fill("E2E Admin Plan Updated");
  await page.getByRole("button", { name: "Perbarui Paket" }).click();
  await expect(page.getByText("E2E Admin Plan Updated", { exact: true })).toBeVisible();
  const updatedPlanCard = page.locator("[data-slot='card']").filter({ hasText: "E2E Admin Plan Updated" });
  await updatedPlanCard.getByRole("button").nth(1).click();
  await page.getByRole("button", { name: "Hapus Paket", exact: true }).click();
  await expect(page.getByText("E2E Admin Plan Updated", { exact: true })).toHaveCount(0);

  await page.goto("/admin/content");
  const slug = `e2e-admin-${fixture.adminAccount.userId.replaceAll("-", "").slice(0, 12)}`;
  await page.getByRole("button", { name: "Tambah Konten" }).click();
  await page.getByLabel("Judul").fill("E2E Content Draft");
  await page.getByLabel("Slug").fill(slug);
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByText("E2E Content Draft", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Judul konten").fill("E2E Content Updated");
  await page.getByLabel("Data konten JSON").fill('{"headline":"Updated from E2E"}');
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByText("E2E Content Updated", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(page.getByText("E2E Content Updated", { exact: true })).toHaveCount(0);

  await page.goto("/admin/announcements");
  await page.getByRole("button", { name: "Buat Announcement" }).click();
  await page.getByPlaceholder("Judul announcement...").fill("E2E Announcement Draft");
  await page.getByPlaceholder("Isi pesan...").fill("Seed announcement for admin workflow test");
  await page.getByRole("button", { name: "Buat", exact: true }).click();
  await expect(page.getByText("E2E Announcement Draft", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit E2E Announcement Draft" }).click();
  await page.getByLabel("Judul", { exact: true }).fill("E2E Announcement Updated");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByText("E2E Announcement Updated", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Aktifkan E2E Announcement Updated" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Hapus E2E Announcement Updated" }).click();
  await expect(page.getByText("E2E Announcement Updated", { exact: true })).toHaveCount(0);

  const flagName = `e2e_admin_${fixture.adminAccount.userId.replaceAll("-", "").slice(0, 8)}`;
  await page.goto("/admin/feature-flags");
  await page.getByLabel("Nama Flag").fill(flagName);
  await page.getByRole("button", { name: "Buat Flag", exact: true }).click();
  const flagCard = page.locator("[data-slot='card']").filter({ hasText: flagName });
  await expect(flagCard).toBeVisible();
  await flagCard.getByLabel(`Deskripsi ${flagName}`).fill("Updated from E2E");
  await flagCard.getByLabel(`Scope ${flagName}`).selectOption("workspace");
  await flagCard.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(flagCard.getByText("Updated from E2E")).toBeVisible();
  await flagCard.getByRole("button", { name: "OFF" }).click();
  await expect(flagCard.getByRole("button", { name: "ON" })).toBeVisible();
  await flagCard.getByRole("button", { name: `Hapus flag ${flagName}` }).click();
  await expect(page.getByText(flagName, { exact: true })).toHaveCount(0);

  await page.goto("/admin/settings");
  const settingForm = page.locator("form").filter({ has: page.locator(`input[name="key"][value="${fixture.settingKey}"]`) });
  await settingForm.locator('textarea[name="value"]').fill("updated by E2E");
  await settingForm.getByRole("button", { name: "Simpan" }).click();
  await expect(settingForm.locator('textarea[name="value"]')).toHaveValue('"updated by E2E"');

  await page.goto("/admin/users");
  await page.getByLabel("Cari pengguna").fill(fixture.email);
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await page.getByRole("button", { name: "Buat Admin" }).click();
  await expect(page.getByText("Admin", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hapus Admin" }).click();
  await expect(page.getByText("Admin", { exact: true })).toHaveCount(0);

  const userPage = await browser.newPage();
  await userPage.goto("/auth/signin");
  await userPage.getByLabel("Email", { exact: true }).fill(fixture.email);
  await userPage.getByLabel("Password", { exact: true }).fill(fixture.password);
  await userPage.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(userPage).toHaveURL("http://localhost:3100/dashboard");
  await userPage.goto("/admin/dashboard");
  await expect(userPage).toHaveURL(/dashboard/);
  await userPage.close();
});
