import "server-only";

import { auth } from "@/lib/actions/auth";
import { sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { workspaceSummarySchema, type WorkspaceSummary } from "@/lib/schemas/workspace-schema";

export async function listMyWorkspaces(): Promise<WorkspaceSummary[]> {
  const session = await auth();
  const userId = z.string().uuid().safeParse(session?.user?.id);

  if (!userId.success) {
    return [];
  }

  const db = getDb();

  const result = await db.execute(sql`
    SELECT
      ww.id,
      ww.name,
      ww.couple_one as "coupleOne",
      ww.couple_two as "coupleTwo",
      ww.wedding_date as "weddingDate",
      ww.location,
      ww.total_budget as "totalBudget",
      ww.cultural_tradition as "culturalTradition",
      ww.invitation_slug as "invitationSlug",
      wm.role
    FROM public.workspace_members wm
    JOIN public.wedding_workspaces ww ON ww.id = wm.workspace_id
    WHERE wm.user_id = ${userId.data}::uuid
    ORDER BY ww.created_at ASC
  `);

  return z.array(workspaceSummarySchema).parse(result.rows);
}
