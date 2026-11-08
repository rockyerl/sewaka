import { sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export const instant = false;

export async function GET() {
  // Skip database check during build — only runs in production
  if (process.env.VERCEL === undefined) {
    return Response.json({
      status: "ok",
      service: "sewaka-web",
      version: "v1",
      database: "skipped (development)",
    });
  }

  try {
    await getDb().execute(sql`select 1`);

    return Response.json({
      status: "ok",
      service: "sewaka-web",
      version: "v1",
      database: "ok",
    });
  } catch (error) {
    logger.error("Health check: database unavailable", error);

    return Response.json(
      {
        status: "unavailable",
        service: "sewaka-web",
        version: "v1",
      },
      { status: 503 },
    );
  }
}
