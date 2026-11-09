import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";

export default async function globalTeardown() {
  const fixturePath = resolve("test-results", ".e2e-account.json");
  if (!existsSync(fixturePath)) return;
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as { userId: string; workspaceId: string; settingKey?: string; adminAccount?: { userId: string } };
  const client = new Client({ connectionString: process.env.E2E_DATABASE_URL });
  await client.connect();
  try {
    await client.query("DELETE FROM wedding_workspaces WHERE id=$1", [fixture.workspaceId]);
    if (fixture.settingKey) await client.query("DELETE FROM system_settings WHERE key=$1", [fixture.settingKey]);
    await client.query("DELETE FROM users WHERE id=$1", [fixture.userId]);
    if (fixture.adminAccount?.userId) {
      await client.query("DELETE FROM admin_contents WHERE created_by=$1", [fixture.adminAccount.userId]);
      await client.query("DELETE FROM announcements WHERE created_by=$1", [fixture.adminAccount.userId]);
      await client.query("DELETE FROM feature_flags WHERE created_by=$1", [fixture.adminAccount.userId]);
      await client.query("DELETE FROM support_ticket_messages WHERE user_id=$1", [fixture.adminAccount.userId]);
      await client.query("DELETE FROM admin_audit_logs WHERE admin_id=$1", [fixture.adminAccount.userId]);
      await client.query("DELETE FROM users WHERE id=$1", [fixture.adminAccount.userId]);
    }
  } finally {
    await client.end();
    unlinkSync(fixturePath);
  }
}
