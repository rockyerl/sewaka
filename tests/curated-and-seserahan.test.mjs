import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

test("curated_vendors is publicly readable by sewaka_app", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const res = await client.query(
    "SELECT id, name, tradition, category FROM curated_vendors"
  );
  assert.ok(res.rows.length > 0, "Curated vendors should return seeded rows");
  assert.ok(
    res.rows.some((v) => v.tradition === "JAWA"),
    "Contains Jawa tradition vendors"
  );
  assert.ok(
    res.rows.some((v) => v.tradition === "SUNDA"),
    "Contains Sunda tradition vendors"
  );
  assert.ok(
    res.rows.some((v) => v.tradition === "MINANG"),
    "Contains Minang tradition vendors"
  );

  await client.end();
});

test("cultural_seserahan_items enforces workspace RLS isolation", async () => {
  const admin = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
  await admin.connect();

  // Create test workspace and user
  const userA = (
    await admin.query(
      "INSERT INTO users (email, name) VALUES ('seserahan_a@sewaka.test', 'User A') RETURNING id"
    )
  ).rows[0].id;
  const userB = (
    await admin.query(
      "INSERT INTO users (email, name) VALUES ('seserahan_b@sewaka.test', 'User B') RETURNING id"
    )
  ).rows[0].id;

  const wsA = (
    await admin.query(
      "INSERT INTO wedding_workspaces (name, cultural_tradition) VALUES ('Pernikahan Adat A', 'JAWA') RETURNING id"
    )
  ).rows[0].id;

  await admin.query(
    "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'OWNER')",
    [wsA, userA]
  );

  await admin.end();

  // App client
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // User A creates seserahan item
  await client.query("BEGIN");
  await client.query("SELECT set_config('app.workspace_id', $1, true)", [wsA]);
  await client.query("SELECT set_config('app.user_id', $1, true)", [userA]);

  const insertRes = await client.query(
    `INSERT INTO cultural_seserahan_items 
     (workspace_id, box_number, title, category, estimated_cost, status) 
     VALUES ($1, 1, 'Kain Batik Tulis Sido Asih', 'BUSANA_ADAT', 3500000, 'PLANNED') 
     RETURNING id`,
    [wsA]
  );
  const itemId = insertRes.rows[0].id;
  assert.ok(itemId, "Item should be inserted");
  await client.query("COMMIT");

  // User B (outsider) attempts to read items in workspace A
  await client.query("BEGIN");
  await client.query("SELECT set_config('app.workspace_id', $1, true)", [wsA]);
  await client.query("SELECT set_config('app.user_id', $1, true)", [userB]);

  const readRes = await client.query(
    "SELECT * FROM cultural_seserahan_items WHERE workspace_id = $1",
    [wsA]
  );
  assert.equal(
    readRes.rows.length,
    0,
    "Outsider User B should not see seserahan items of Workspace A"
  );
  await client.query("COMMIT");

  // Cleanup
  const cleanup = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
  await cleanup.connect();
  await cleanup.query("DELETE FROM wedding_workspaces WHERE id = $1", [wsA]);
  await cleanup.query("DELETE FROM users WHERE id IN ($1, $2)", [userA, userB]);
  await cleanup.end();

  await client.end();
});
