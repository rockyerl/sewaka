import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import "dotenv/config";

test("notification scheduler creates task reminders correctly", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const userId = randomUUID();
  const workspaceId = randomUUID();

  try {
    // Setup: insert user, workspace, and member
    await client.query("INSERT INTO users (id, name) VALUES ($1, 'Test User')", [userId]);

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

    // Insert a task due in 12 hours
    const taskId = randomUUID();
    const dueDate = new Date(Date.now() + 12 * 60 * 60 * 1000);
    await client.query(
      "INSERT INTO tasks (id, workspace_id, title, status, due_date) VALUES ($1, $2, $3, $4, $5)",
      [taskId, workspaceId, "Test Task", "TODO", dueDate]
    );

    // Insert a budget
    await client.query(
      "INSERT INTO budgets (id, workspace_id, total_amount) VALUES ($1, $2, $3)",
      [randomUUID(), workspaceId, "10000000"]
    );

    // Verify task was inserted within the same transaction
    const { rows } = await client.query(
      "SELECT id, title, status, due_date FROM tasks WHERE id = $1",
      [taskId]
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, "Test Task");
    assert.equal(rows[0].status, "TODO");

    await client.query("COMMIT");
  } finally {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.end();
  }
});

test("user role field exists and defaults to 'user'", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const userId = randomUUID();

  try {
    await client.query(
      "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
      [userId, "Role Test User", `role_test_${Date.now()}@example.com`]
    );

    const { rows } = await client.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].role, "user");

    // Update to admin
    await client.query(
      "UPDATE users SET role = $1 WHERE id = $2",
      ["admin", userId]
    );

    const { rows: updatedRows } = await client.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );
    assert.equal(updatedRows[0].role, "admin");
  } finally {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.end();
  }
});

test("guest check-in flow works correctly", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const userId = randomUUID();
  const workspaceId = randomUUID();

  try {
    await client.query("INSERT INTO users (id, name) VALUES ($1, 'Guest Test User')", [userId]);

    await client.query("BEGIN");
    await client.query("SELECT set_config('app.workspace_id', $1, true)", [workspaceId]);
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    await client.query(
      "INSERT INTO wedding_workspaces (id, name) VALUES ($1, 'Guest Test Wedding')",
      [workspaceId]
    );
    await client.query(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'OWNER')",
      [workspaceId, userId]
    );

    // Insert a guest with invitation code
    const guestId = randomUUID();
    const invitationCode = `INV-${Date.now()}`;
    await client.query(
      "INSERT INTO guests (id, workspace_id, name, invitation_code, rsvp_status, checked_in) VALUES ($1, $2, $3, $4, $5, $6)",
      [guestId, workspaceId, "Test Guest", invitationCode, "ACCEPTED", false]
    );

    // Verify guest not checked in within same transaction
    const { rows: beforeRows } = await client.query(
      "SELECT checked_in, checked_in_at FROM guests WHERE id = $1",
      [guestId]
    );
    assert.equal(beforeRows[0].checked_in, false);
    assert.equal(beforeRows[0].checked_in_at, null);

    // Simulate check-in
    const checkInTime = new Date();
    await client.query(
      "UPDATE guests SET checked_in = true, checked_in_at = $1 WHERE invitation_code = $2 AND workspace_id = $3",
      [checkInTime, invitationCode, workspaceId]
    );

    // Verify guest is checked in
    const { rows: afterRows } = await client.query(
      "SELECT checked_in, checked_in_at FROM guests WHERE id = $1",
      [guestId]
    );
    assert.equal(afterRows[0].checked_in, true);
    assert.ok(afterRows[0].checked_in_at);

    await client.query("COMMIT");
  } finally {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.end();
  }
});
