require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const migrationFile = path.join(__dirname, "..", "drizzle", "0025_check_in_offline.sql");
const sql = fs.readFileSync(migrationFile, "utf-8");

async function runMigration() {
  const client = new Client(process.env.MIGRATION_DATABASE_URL);
  
  try {
    await client.connect();
    console.log("✓ Connected to database");
    
    // Remove SQL comments and split into statements
    const cleanedSql = sql
      .split("\n")
      .filter(line => !line.trim().startsWith("--"))
      .join("\n");
    
    const statements = cleanedSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 80)}...`);
        await client.query(statement);
        console.log("✓ Executed");
      }
    }
    
    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('check_in_logs', 'guests')
    `);
    
    console.log("\n✓ Migration completed successfully!");
    console.log("Tables found:", result.rows.map(r => r.table_name).join(", "));
    
    // Verify new columns in guests
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'guests' 
      AND column_name IN ('checked_in_by', 'checked_in_device')
    `);
    
    console.log("New columns in guests:", columns.rows.map(r => r.column_name).join(", "));
    
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
