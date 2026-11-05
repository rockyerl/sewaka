import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";

const migrationUrl = new URL("../drizzle/0000_odd_nocturne.sql", import.meta.url);
const ownerId = "10000000-0000-4000-8000-000000000001";
const familyId = "10000000-0000-4000-8000-000000000002";
const thirdUserId = "10000000-0000-4000-8000-000000000003";
const workspaceId = "20000000-0000-4000-8000-000000000001";
const otherWorkspaceId = "20000000-0000-4000-8000-000000000002";

test("workspace RLS isolates tenants and enforces member roles", async () => {
  const db = new PGlite();

  try {
    await db.exec(`
      CREATE ROLE sewaka_rls NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE BYPASSRLS;
      CREATE ROLE sewaka_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
      GRANT CREATE ON SCHEMA public TO sewaka_rls;
    `);

    for (const file of [
      migrationUrl,
      new URL("../drizzle/0001_list_my_workspaces.sql", import.meta.url),
    ]) {
      const migration = await readFile(file, "utf8");
      for (const statement of migration
        .split("--> statement-breakpoint")
        .map((part) => part.trim())
        .filter(Boolean)) {
        await db.exec(statement);
      }
    }

    await db.exec(
      "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sewaka_app",
    );
    await db.query(
      `INSERT INTO users (id, name) VALUES
        ($1, 'Owner'), ($2, 'Family'), ($3, 'Collaborator')`,
      [ownerId, familyId, thirdUserId],
    );
    await db.query(
      `INSERT INTO wedding_workspaces (id, name) VALUES
        ($1, 'Workspace A'), ($2, 'Workspace B')`,
      [workspaceId, otherWorkspaceId],
    );
    await db.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
        ($1, $2, 'OWNER'), ($1, $3, 'FAMILY'), ($4, $5, 'OWNER')`,
      [workspaceId, ownerId, familyId, otherWorkspaceId, thirdUserId],
    );
    await db.query(
      `INSERT INTO guests (workspace_id, name) VALUES
        ($1, 'Private guest A'), ($2, 'Private guest B')`,
      [workspaceId, otherWorkspaceId],
    );
    const [{ id: taskId }] = (
      await db.query(
        "INSERT INTO tasks (workspace_id, title) VALUES ($1, 'Discuss venue') RETURNING id",
        [workspaceId],
      )
    ).rows;
    await db.query(
      "INSERT INTO budgets (workspace_id, total_amount) VALUES ($1, '1000000.00')",
      [workspaceId],
    );
    const [{ id: categoryId }] = (
      await db.query(
        `INSERT INTO budget_categories (workspace_id, name, allocated_amount)
         VALUES ($1, 'Venue', '500000.00') RETURNING id`,
        [workspaceId],
      )
    ).rows;
    await db.query(
      `INSERT INTO expenses (workspace_id, category_id, amount, note)
       VALUES ($1, $2, '125000.00', 'Down payment')`,
      [workspaceId, categoryId],
    );

    async function asUser(userId, currentWorkspaceId, operation) {
      await db.exec("BEGIN");
      try {
        await db.exec("SET ROLE sewaka_app");
        await db.query(
          `SELECT set_config('app.workspace_id', $1, true),
                  set_config('app.user_id', $2, true)`,
          [currentWorkspaceId, userId],
        );
        return await operation();
      } finally {
        await db.exec("ROLLBACK");
        await db.exec("RESET ROLE");
      }
    }

    const visibleToFamily = await asUser(familyId, workspaceId, async () => {
      const { rows } = await db.query(
        "SELECT name FROM guests ORDER BY name",
      );
      return rows.map(({ name }) => name);
    });
    assert.deepEqual(visibleToFamily, ["Private guest A"]);

    const familyWorkspaces = await asUser(familyId, workspaceId, async () => {
      const { rows } = await db.query(
        "SELECT id, role FROM public.list_my_workspaces()",
      );
      return rows;
    });
    assert.deepEqual(familyWorkspaces, [{ id: workspaceId, role: "FAMILY" }]);
    const familyBudget = await asUser(familyId, workspaceId, async () => {
      const { rows } = await db.query(`
        SELECT b.total_amount, c.allocated_amount, e.amount
        FROM budgets b
        JOIN budget_categories c ON c.workspace_id = b.workspace_id
        JOIN expenses e ON e.category_id = c.id
      `);
      return rows;
    });
    assert.deepEqual(familyBudget, [
      {
        total_amount: "1000000.00",
        allocated_amount: "500000.00",
        amount: "125000.00",
      },
    ]);

    await assert.rejects(
      asUser(familyId, workspaceId, () =>
        db.query("INSERT INTO guests (workspace_id, name) VALUES ($1, 'Denied')", [
          workspaceId,
        ]),
      ),
      /row-level security/i,
    );
    const familyTaskEdit = await asUser(familyId, workspaceId, () =>
      db.query("UPDATE tasks SET status = 'COMPLETED' WHERE id = $1", [taskId]),
    );
    assert.equal(familyTaskEdit.rowCount, 0);
    await assert.rejects(
      asUser(familyId, workspaceId, () =>
        db.query(
          "INSERT INTO expenses (workspace_id, amount) VALUES ($1, '100.00')",
          [workspaceId],
        ),
      ),
      /row-level security/i,
    );

    const tenantIsolation = await asUser(familyId, otherWorkspaceId, async () => {
      const { rows } = await db.query("SELECT name FROM guests");
      return rows;
    });
    assert.deepEqual(tenantIsolation, []);

    const ownerManagement = await asUser(ownerId, workspaceId, async () => {
      const blockedOwnerUpdate = await db.query(
        `UPDATE workspace_members SET role = 'FAMILY'
         WHERE workspace_id = $1 AND user_id = $2`,
        [workspaceId, ownerId],
      );
      const insertedCollaborator = await db.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, 'PARTNER') RETURNING user_id`,
        [workspaceId, thirdUserId],
      );
      const insertedExpense = await db.query(
        `INSERT INTO expenses (workspace_id, category_id, amount, note)
         VALUES ($1, $2, '250.00', 'Venue deposit') RETURNING id`,
        [workspaceId, categoryId],
      );
      const updatedBudget = await db.query(
        `UPDATE budgets SET total_amount = '1200000.00'
         WHERE workspace_id = $1 RETURNING total_amount`,
        [workspaceId],
      );
      return { blockedOwnerUpdate, insertedCollaborator, insertedExpense, updatedBudget };
    });
    assert.equal(ownerManagement.blockedOwnerUpdate.rowCount, 0);
    assert.equal(ownerManagement.insertedCollaborator.rowCount, 1);
    assert.equal(ownerManagement.insertedExpense.rowCount, 1);
    assert.equal(ownerManagement.updatedBudget.rows[0].total_amount, "1200000.00");
  } finally {
    await db.close();
  }
});
