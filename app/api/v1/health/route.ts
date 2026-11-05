import { sql } from "drizzle-orm";

import { getDb } from "@/db";

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
    console.error(
      JSON.stringify({
        event: "health_check.database_unavailable",
        message: error instanceof Error ? error.message : "Unknown database error",
      }),
    );

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
