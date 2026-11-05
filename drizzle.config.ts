import "dotenv/config";

import { defineConfig } from "drizzle-kit";
import { z } from "zod";

const migrationDatabaseUrl = z
  .string()
  .url()
  .refine(
    (value) =>
      value.toLowerCase().startsWith("postgres://") ||
      value.toLowerCase().startsWith("postgresql://"),
    {
      message:
        "MIGRATION_DATABASE_URL must use the postgres or postgresql protocol",
    },
  )
  .parse(process.env.MIGRATION_DATABASE_URL);

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: migrationDatabaseUrl },
  strict: true,
  verbose: true,
});
