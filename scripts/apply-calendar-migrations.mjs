import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Client } from "pg";

const targetBranch = process.env.MIGRATION_TARGET_BRANCH;
const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!targetBranch || !connectionString) {
  throw new Error("Set MIGRATION_TARGET_BRANCH and a direct MIGRATION_DATABASE_URL before applying migrations");
}
const url = new URL(connectionString);
if (url.hostname.includes("-pooler")) throw new Error("Use a direct Neon endpoint for migrations");
if (targetBranch === "production" && process.env.APPLY_PRODUCTION_MIGRATION !== "CONFIRMED") {
  throw new Error("Production migration requires APPLY_PRODUCTION_MIGRATION=CONFIRMED");
}
if (targetBranch !== "production" && process.env.APPLY_PRODUCTION_MIGRATION) {
  throw new Error("Do not pass the production confirmation for a non-production branch");
}

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query("BEGIN");
  for (const file of ["drizzle/0031_merge_nikah_berkas.sql", "drizzle/0032_public_guest_check_in.sql", "drizzle/0033_calendar_sync_token_expiry.sql"]) {
    await client.query(await readFile(file, "utf8"));
  }
  await client.query("COMMIT");
  console.log(`Migrations 0031, 0032, and 0033 applied to Neon branch ${targetBranch}.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
