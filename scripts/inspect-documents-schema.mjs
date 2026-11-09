import { Client } from "pg";

const connectionString = process.env.E2E_DATABASE_URL;
if (!connectionString || process.env.E2E_BRANCH === "production") throw new Error("Use an isolated test branch");
const client = new Client({ connectionString });
await client.connect();
try {
  const result = await client.query(
    "SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('documents','nikah_berkas') ORDER BY table_name,ordinal_position",
  );
  for (const row of result.rows) console.log(`${row.table_name}.${row.column_name}`);
} finally {
  await client.end();
}
