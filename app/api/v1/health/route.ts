import { connection } from "next/server";
import { sql } from "drizzle-orm";

import { getDb } from "@/db";

export async function GET() {
  await connection();

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
