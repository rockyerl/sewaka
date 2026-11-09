import { Client } from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
config({ path: join(__dirname, "..", ".env") });

const migrationSql = readFileSync(
  join(__dirname, "..", "drizzle", "0026_competitive_features.sql"),
  "utf8"
);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to database");

    // Execute entire migration as a single transaction
    await client.query("BEGIN");
    
    // Split by semicolons and execute each statement
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      const firstLine = stmt.split("\n")[0];
      console.log(`Executing: ${firstLine.substring(0, 80)}...`);
      await client.query(stmt);
      console.log("✓ Success");
    }

    await client.query("COMMIT");
    console.log("All migrations completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
