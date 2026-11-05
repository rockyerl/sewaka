import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/env";

import { drizzleSchema } from "./schema";

export type Database = NodePgDatabase<typeof drizzleSchema>;

type DatabaseGlobals = typeof globalThis & {
  sewakaPool?: Pool;
  sewakaDb?: Database;
};

const globalForDatabase = globalThis as DatabaseGlobals;

export function getDb(): Database {
  if (globalForDatabase.sewakaDb) {
    return globalForDatabase.sewakaDb;
  }

  const env = getEnv();
  const pool =
    globalForDatabase.sewakaPool ??
    new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      statement_timeout: 10_000,
      query_timeout: 12_000,
      keepAlive: true,
      application_name: "sewaka-web",
      ...(env.NODE_ENV === "production"
        ? { ssl: { rejectUnauthorized: true } }
        : {}),
    });

  if (!globalForDatabase.sewakaPool) {
    pool.on("error", (error) => {
      console.error(
        JSON.stringify({
          event: "database.idle_client_error",
          message: error.message,
        }),
      );
    });
  }

  globalForDatabase.sewakaPool = pool;
  globalForDatabase.sewakaDb = drizzle(pool, { schema: drizzleSchema });

  return globalForDatabase.sewakaDb;
}
