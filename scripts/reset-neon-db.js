require('dotenv/config');
const { Pool } = require('pg');

const p = new Pool({ connectionString: process.env.MIGRATION_DATABASE_URL });

(async () => {
  // Drop all tables
  const tables = await p.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name != '__drizzle_migrations'"
  );
  for (const t of tables.rows) {
    await p.query(`DROP TABLE IF EXISTS public."${t.table_name}" CASCADE`);
    console.log(`Dropped ${t.table_name}`);
  }

  // Drop all functions first
  const funcs = await p.query(
    "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'"
  );
  for (const f of funcs.rows) {
    await p.query(`DROP FUNCTION IF EXISTS public."${f.routine_name}" CASCADE`);
    console.log(`Dropped function ${f.routine_name}`);
  }

  // Drop all enums (with CASCADE)
  const types = await p.query(
    "SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')"
  );
  for (const t of types.rows) {
    await p.query(`DROP TYPE IF EXISTS public."${t.typname}" CASCADE`);
    console.log(`Dropped type ${t.typname}`);
  }

  // Clear migrations
  await p.query('DELETE FROM __drizzle_migrations');
  console.log('Cleared migrations table');


  console.log('\nDatabase reset complete!');
  await p.end();
})();
