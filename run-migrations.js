import "dotenv/config";
import { Client } from "pg";

async function run() {
  // Try DATABASE_URL (sewaka_app) first, then MIGRATION_DATABASE_URL (owner)
  const urls = [
    { name: "DATABASE_URL (app role)", url: process.env.DATABASE_URL },
    { name: "MIGRATION_DATABASE_URL (owner)", url: process.env.MIGRATION_DATABASE_URL },
  ].filter(x => x.url);

  let client;
  let ownerClient;
  let connected = false;
  let usedUrl = "";
  let ownerUrl = "";

  for (const { name, url } of urls) {
    try {
      console.log(`Trying ${name}...`);
      const c = new Client({ connectionString: url });
      await c.connect();
      console.log(`✓ Connected with ${name}!`);
      if (!connected) {
        client = c;
        connected = true;
        usedUrl = name;
      }
      if (name.includes('owner')) {
        ownerClient = c;
        ownerUrl = url;
      }
    } catch (err) {
      console.log(`✗ ${name} failed: ${err.message}`);
    }
  }

  console.log();

  if (!connected || !client) {
    console.error("Failed to connect with any database URL");
    process.exit(1);
  }

  try {

    // List all tables
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    const tableNames = tables.map(t => t.table_name);

    console.log("Tables in database:");
    tableNames.forEach(t => console.log(`  - ${t}`));
    console.log();

    // Check new feature tables from 0002
    const newTables = [
      'task_categories', 'checklist_templates', 'template_tasks',
      'vendor_quotations', 'vendor_payments', 'documents', 'notifications',
      'subscription_plans', 'subscriptions', 'payment_transactions'
    ];

    console.log("New feature tables (0002):");
    for (const t of newTables) {
      console.log(`  ${tableNames.includes(t) ? '✓' : '✗'} ${t}`);
    }
    console.log();

    // Check tasks.category_id column
    const { rows: cols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'tasks' AND column_name = 'category_id'
    `);
    console.log(`  ${cols.length > 0 ? '✓' : '✗'} tasks.category_id column`);
    console.log();

    // Check policies
    const { rows: policies } = await client.query(`
      SELECT policyname, tablename FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN ('wedding_workspaces', 'workspace_members')
      ORDER BY tablename, policyname
    `);
    console.log("RLS policies:");
    policies.forEach(p => console.log(`  - ${p.tablename}: ${p.policyname}`));
    console.log();

    const has0003 = policies.some(p => p.policyname === 'workspace_create_for_user');
    const has0004 = policies.some(p => p.policyname === 'workspace_owner_add_self');
    let has0006 = policies.some(p => p.policyname === 'workspace_member_read_by_user');
    const has0002 = newTables.every(t => tableNames.includes(t)) && cols.length > 0;

    // Check users table RLS
    const { rows: usersRlsRows } = await client.query(`
      SELECT relrowsecurity FROM pg_class WHERE relname = 'users'
    `);
    const isUsersRlsDisabled = usersRlsRows.length > 0 && !usersRlsRows[0].relrowsecurity;

    console.log("Migration status:");
    console.log(`  0000_odd_nocturne.sql: ${tableNames.includes('users') ? '✓ applied' : '✗ needed'}`);
    console.log(`  0001_list_my_workspaces.sql: ${tableNames.includes('wedding_workspaces') ? '✓ applied' : '✗ needed'}`);
    console.log(`  0002_add_new_features.sql: ${has0002 ? '✓ applied' : '✗ NEEDED'}`);
    console.log(`  0003_fix_workspace_create_policy.sql: ${has0003 ? '✓ applied' : '✗ NEEDED'}`);
    console.log(`  0004_fix_workspace_member_insert_policy.sql: ${has0004 ? '✓ applied' : '✗ NEEDED'}`);
    console.log(`  0006_add_member_read_by_user_policy.sql: ${has0006 ? '✓ applied' : '✗ NEEDED'}`);
    console.log(`  0007_disable_users_rls.sql: ${isUsersRlsDisabled ? '✓ applied' : '✗ NEEDED'}`);
    console.log();

    if (!isUsersRlsDisabled) {
      console.log("🔧 Attempting to apply 0007_disable_users_rls.sql...");
      const applyClient = ownerClient || client;
      try {
        await applyClient.query(`ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;`);
        console.log("✓ 0007 applied successfully!");
      } catch (err) {
        console.log(`⚠ Failed to apply 0007: ${err.message}`);
      }
    }

    // Try to apply 0006 if missing - use owner role if available
    if (!has0006) {
      console.log("🔧 Attempting to apply 0006_add_member_read_by_user_policy.sql...");
      const applyClient = ownerClient || client;
      const applyName = ownerClient ? "owner role" : "app role";
      try {
        await applyClient.query(`
          CREATE POLICY workspace_member_read_by_user
          ON public.workspace_members
          FOR SELECT
          TO sewaka_app
          USING (
            user_id = nullif(current_setting('app.user_id', true), '')::uuid
          )
        `);
        console.log(`✓ 0006 applied successfully using ${applyName}!`);
        has0006 = true;
      } catch (err) {
        console.log(`⚠ Failed to apply 0006 with ${applyName}: ${err.message}`);
        if (!ownerClient) {
          console.log("Owner role not available. Please run migration manually.");
        }
      }
    }

    if (!has0002 || !has0003 || !has0004 || !has0006) {
      console.log("⚠ Some migrations need to be applied.");
      console.log("They require the database OWNER role to execute.");
      console.log();
      console.log("Current connection uses:", usedUrl);
    } else {
      console.log("✓ All migrations are already applied!");
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
