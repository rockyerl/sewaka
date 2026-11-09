import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";

const connectionString = process.env.E2E_DATABASE_URL;
if (!connectionString) throw new Error("E2E_DATABASE_URL must point to an isolated Neon test branch");
const url = new URL(connectionString);
if (url.hostname.includes("-pooler") || process.env.E2E_BRANCH === "production") {
  throw new Error("Migration verification requires a direct connection to a non-production branch");
}

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query("BEGIN");
  const expiryColumn = await client.query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='calendar_syncs' AND column_name='token_expires_at'",
  );
  assert.equal(expiryColumn.rowCount, 1);
  const procedure = await client.query("SELECT to_regprocedure('public.public_guest_check_in(text)') IS NOT NULL AS installed");
  assert.equal(procedure.rows[0].installed, true);
  const userId = (await client.query(
    "INSERT INTO users (name,email) VALUES ('Migration Test', $1) RETURNING id",
    [`migration-test-${randomUUID()}@sewaka.invalid`],
  )).rows[0].id;
  const workspaceId = (await client.query(
    "INSERT INTO wedding_workspaces (name,invitation_slug) VALUES ('Migration Test', $1) RETURNING id",
    [`migration-${randomUUID()}`],
  )).rows[0].id;
  await client.query(
    "INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,'OWNER')",
    [workspaceId, userId],
  );
  const code = `SWK-MIG-${randomUUID()}`;
  const guestId = (await client.query(
    "INSERT INTO guests (workspace_id,name,rsvp_status,invitation_code) VALUES ($1,'Migration Guest','PENDING',$2) RETURNING id",
    [workspaceId, code],
  )).rows[0].id;

  const grant = await client.query(
    "SELECT has_function_privilege('sewaka_app','public.public_guest_check_in(text)','EXECUTE') AS allowed",
  );
  assert.equal(grant.rows[0].allowed, true);

  await client.query("SET LOCAL ROLE sewaka_app");
  const first = await client.query("SELECT public.public_guest_check_in($1) AS result", [code]);
  assert.equal(first.rows[0].result.success, true);
  const second = await client.query("SELECT public.public_guest_check_in($1) AS result", [code]);
  assert.equal(second.rows[0].result.alreadyCheckedIn, true);
  await client.query("RESET ROLE");

  const logs = await client.query("SELECT count(*)::int AS count FROM check_in_logs WHERE guest_id=$1", [guestId]);
  assert.equal(logs.rows[0].count, 1);
  await client.query("ROLLBACK");
  console.log("Migration 0032/0033 verified: grants, scoped check-in, idempotency, and audit logging.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
