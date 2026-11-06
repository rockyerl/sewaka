require('dotenv/config');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.MIGRATION_DATABASE_URL,
});

async function runMigrations() {
  const drizzleDir = path.join(__dirname, 'drizzle');
  const files = fs.readdirSync(drizzleDir).sort();
  
  console.log(`Found ${files.length} migration files`);
  
  // Create __drizzle_migrations table if not exists
  console.log('Ensuring __drizzle_migrations table exists...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✓ __drizzle_migrations table ready');
  
  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    
    const migrationHash = file.replace('.sql', '');
    
    // Check if already applied
    const existing = await pool.query(
      'SELECT id FROM __drizzle_migrations WHERE hash = $1',
      [migrationHash]
    );
    
    if (existing.rows.length > 0) {
      console.log(`✓ ${file} (already applied)`);
      continue;
    }
    
    console.log(`→ Applying ${file}...`);
    const sql = fs.readFileSync(path.join(drizzleDir, file), 'utf8');
    
    try {
      await pool.query('BEGIN');
      await pool.query(sql);
      await pool.query('INSERT INTO __drizzle_migrations (hash) VALUES ($1)', [migrationHash]);
      await pool.query('COMMIT');
      console.log(`✓ ${file} applied`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`✗ ${file} failed:`, error.message);
      throw error;
    }
  }
  
  console.log('\nAll migrations applied!');
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
