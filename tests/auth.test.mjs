import assert from "node:assert/strict";
import test from "node:test";
import { hash, compare } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import "dotenv/config";

test("auth and registration flow operates reliably with sewaka_app role", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const testEmail = `test_auth_${Date.now()}@example.com`;
  const testPassword = "ValidPassword123!";
  const testName = "Budi Santoso";
  const userId = randomUUID();

  try {
    // 1. Verify user can be inserted via sewaka_app without RLS violation
    const passwordHash = await hash(testPassword, 12);

    await client.query("BEGIN");
    await client.query(
      "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
      [userId, testName, testEmail]
    );
    await client.query(
      "INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)",
      [userId, passwordHash]
    );
    await client.query("COMMIT");

    // 2. Verify query by email
    const { rows } = await client.query(
      `SELECT u.id, u.name, u.email, uc.password_hash 
       FROM users u 
       INNER JOIN user_credentials uc ON u.id = uc.user_id 
       WHERE u.email = $1 LIMIT 1`,
      [testEmail]
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, testEmail);
    assert.equal(rows[0].name, testName);

    // 3. Verify password comparison
    const isCorrect = await compare(testPassword, rows[0].password_hash);
    assert.equal(isCorrect, true);

    const isWrong = await compare("WrongPassword!", rows[0].password_hash);
    assert.equal(isWrong, false);

    // 4. Verify duplicate email constraint
    let duplicateFailed = false;
    try {
      await client.query(
        "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
        [randomUUID(), "Duplicate User", testEmail]
      );
    } catch (err) {
      duplicateFailed = true;
      assert.equal(err.code, "23505"); // unique_violation
    }
    assert.equal(duplicateFailed, true);
  } finally {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.end();
  }
});

test("workspace_members RLS requires app.user_id to be set before query", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const userId = randomUUID();
  const workspaceId = randomUUID();

  try {
    // Insert user, workspace, and workspace_member
    await client.query("INSERT INTO users (id, name) VALUES ($1, 'Workspace Test User')", [userId]);

    await client.query("BEGIN");
    await client.query("SELECT set_config('app.workspace_id', $1, true)", [workspaceId]);
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    await client.query(
      "INSERT INTO wedding_workspaces (id, name) VALUES ($1, 'Test Wedding')",
      [workspaceId]
    );
    await client.query(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'OWNER')",
      [workspaceId, userId]
    );
    await client.query("COMMIT");

    // 1. Without setting app.user_id, reading workspace_members returns 0 rows (denied by RLS)
    const withoutConfig = await client.query(
      "SELECT role FROM workspace_members WHERE user_id = $1",
      [userId]
    );
    assert.equal(withoutConfig.rows.length, 0);

    // 2. With setting app.user_id first (what withWorkspace now does), row is returned
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    const withConfig = await client.query(
      "SELECT role FROM workspace_members WHERE user_id = $1",
      [userId]
    );
    assert.equal(withConfig.rows.length, 1);
    assert.equal(withConfig.rows[0].role, "OWNER");
    await client.query("ROLLBACK");
  } finally {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.end();
  }
});

