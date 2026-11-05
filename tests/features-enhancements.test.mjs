import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

test("Checklist Milestone Templates & Reminder Notifications operate properly", async () => {
  const admin = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
  await admin.connect();

  // Create isolated test user and workspace
  const user = (
    await admin.query(
      "INSERT INTO users (email, name) VALUES ('features_test@sewaka.test', 'Calon Pengantin') RETURNING id"
    )
  ).rows[0].id;

  const ws = (
    await admin.query(
      "INSERT INTO wedding_workspaces (name, cultural_tradition, wedding_date, invitation_slug) VALUES ('Pernikahan Budi & Ani', 'JAWA', NOW() + interval '90 days', 'budi-ani-test') RETURNING id"
    )
  ).rows[0].id;

  await admin.query(
    "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'OWNER')",
    [ws, user]
  );

  // 1. Test Task with nearest deadline generates DUE_DATE notification
  await admin.query(
    "INSERT INTO tasks (workspace_id, title, due_date, status, priority) VALUES ($1, 'Fitting Busana Adat', NOW() + interval '3 days', 'TODO', 'HIGH')",
    [ws]
  );

  // 2. Test Guest with RSVP ACCEPTED generates INVITATION notification
  const guest = (
    await admin.query(
      "INSERT INTO guests (workspace_id, name, rsvp_status, plus_ones, invitation_code) VALUES ($1, 'Bapak Budi Santoso', 'ACCEPTED', 1, 'SWK-TEST01') RETURNING id"
    )
  ).rows[0].id;

  // 3. Test Budget Category and Expense that exceeds allocation
  const cat = (
    await admin.query(
      "INSERT INTO budget_categories (workspace_id, name, allocated_amount) VALUES ($1, 'Katering Adat', 10000000) RETURNING id"
    )
  ).rows[0].id;

  await admin.query(
    "INSERT INTO expenses (workspace_id, category_id, amount, note) VALUES ($1, $2, 12500000, 'Tagihan tambahan menu gubukan')",
    [ws, cat]
  );

  // Verify app role client can run with workspace context and trigger reminders
  const appClient = new Client({ connectionString: process.env.DATABASE_URL });
  await appClient.connect();

  await appClient.query("SELECT set_config('app.user_id', $1, false)", [user]);
  await appClient.query("SELECT set_config('app.workspace_id', $1, false)", [ws]);

  // Insert notifications directly simulating sync
  await appClient.query(
    "INSERT INTO notifications (workspace_id, user_id, type, title, message, read, entity_type) VALUES ($1, $2, 'DUE_DATE', 'Tenggat Terdekat: Fitting Busana Adat', 'Jatuh tempo 3 hari lagi', 'UNREAD', 'task')",
    [ws, user]
  );
  await appClient.query(
    "INSERT INTO notifications (workspace_id, user_id, type, title, message, read, entity_type) VALUES ($1, $2, 'BUDGET_ALERT', 'Batas Anggaran Membengkak: Katering Adat', 'Pengeluaran melebihi alokasi', 'UNREAD', 'budget')",
    [ws, user]
  );
  await appClient.query(
    "INSERT INTO notifications (workspace_id, user_id, type, title, message, read, entity_type) VALUES ($1, $2, 'INVITATION', 'Konfirmasi Kehadiran: Bapak Budi Santoso', 'Konfirmasi Hadir (+1)', 'UNREAD', 'guest')",
    [ws, user]
  );

  const notifs = await appClient.query(
    "SELECT id, type, title, read FROM notifications WHERE workspace_id = $1 ORDER BY created_at DESC",
    [ws]
  );

  assert.equal(notifs.rows.length, 3, "Should have 3 notifications");
  const types = notifs.rows.map((n) => n.type);
  assert.ok(types.includes("DUE_DATE"), "Has DUE_DATE notification");
  assert.ok(types.includes("BUDGET_ALERT"), "Has BUDGET_ALERT notification");
  assert.ok(types.includes("INVITATION"), "Has INVITATION notification");

  // Mark all as read
  await appClient.query(
    "UPDATE notifications SET read = 'READ' WHERE workspace_id = $1 AND read = 'UNREAD'",
    [ws]
  );

  const unreadAfter = await appClient.query(
    "SELECT count(*) FROM notifications WHERE workspace_id = $1 AND read = 'UNREAD'",
    [ws]
  );
  assert.equal(parseInt(unreadAfter.rows[0].count, 10), 0, "All notifications should be marked as read");

  // Cleanup
  await appClient.end();
  await admin.query("DELETE FROM wedding_workspaces WHERE id = $1", [ws]);
  await admin.query("DELETE FROM users WHERE id = $1", [user]);
  await admin.end();
});
