import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

export type E2EAccount = { email: string; password: string; userId: string; workspaceId: string };

export function getE2EAccount(): E2EAccount {
  return JSON.parse(readFileSync("test-results/.e2e-account.json", "utf8")) as E2EAccount;
}

export async function signInE2EAccount(page: Page) {
  const account = getE2EAccount();
  await page.goto("/auth/signin");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  return account;
}
