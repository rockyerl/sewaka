import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/utils/env";
import { logger } from "@/lib/utils/logger";

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

  // Append sslmode=verify-full to silence pg-connection-string deprecation warning
  // and ensure consistent SSL behavior across pg v8 and v9.
  let connectionString = env.DATABASE_URL;
  const separator = connectionString.includes("?") ? "&" : "?";
  if (!connectionString.includes("sslmode=")) {
    connectionString = `${connectionString}${separator}sslmode=verify-full`;
  }

  const pool =
    globalForDatabase.sewakaPool ??
    new Pool({
      connectionString,
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
      logger.error("Database idle client error", error);
    });
  }

  globalForDatabase.sewakaPool = pool;
  globalForDatabase.sewakaDb = drizzle(pool, { schema: drizzleSchema });

  return globalForDatabase.sewakaDb;
}
