const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

async function run() {
  const pool = new Pool({
    connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  });

  const tables = ['feature_flags', 'system_settings', 'admin_audit_logs', 'announcements'];
  
  for (const table of tables) {
    try {
      await pool.query(`GRANT ALL PRIVILEGES ON TABLE ${table} TO sewaka_app;`);
      console.log(`✅ Grant: ${table}`);
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
