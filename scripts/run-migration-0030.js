const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, '..', 'drizzle', '0030_remaining_gaps.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Parse DATABASE_URL from .env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
let dbUrlMatch = envContent.match(/^MIGRATION_DATABASE_URL="?(.+?)"?$/m);
if (!dbUrlMatch) {
  dbUrlMatch = envContent.match(/^DATABASE_URL_UNPOOLED="?(.+?)"?$/m);
}
if (!dbUrlMatch) {
  dbUrlMatch = envContent.match(/^DATABASE_URL="?(.+?)"?$/m);
}
if (!dbUrlMatch) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}
let dbUrl = dbUrlMatch[1].trim().replace(/^"|"$/g, '');
dbUrl = dbUrl.replace('channel_binding=require&', '');
console.log('Using database URL:', dbUrl.split('@')[0] + '@' + dbUrl.split('@')[1].split('/')[0]);

console.log('Running migration 0030_remaining_gaps.sql...');

try {
  const { Client } = require('pg');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  client.connect()
    .then(() => {
      console.log('Connected to database');
      return client.query(sql);
    })
    .then(() => {
      console.log('Migration 0030 completed successfully!');
      client.end();
    })
    .catch(err => {
      console.error('Migration failed:', err.message);
      client.end();
      process.exit(1);
    });
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
