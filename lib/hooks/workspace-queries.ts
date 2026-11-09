import "server-only";

import { getCurrentUser } from "@/lib/auth-cache";
import { sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { workspaceSummarySchema, type WorkspaceSummary } from "@/lib/schemas/workspace-schema";

export async function listMyWorkspaces(): Promise<WorkspaceSummary[]> {
  const sessionUser = await getCurrentUser();
  const userId = z.string().uuid().safeParse(sessionUser?.id);

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

export async function ensureInvitationSlug(workspaceId: string) {
  const db = getDb();
  const { weddingWorkspaces } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { revalidatePath } = await import("next/cache");

  const [workspace] = await db
    .select()
    .from(weddingWorkspaces)
    .where(eq(weddingWorkspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    throw new Error("Workspace tidak ditemukan");
  }

  if (workspace.invitationSlug) {
    return workspace;
  }

  const baseName =
    workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} ${workspace.coupleTwo}`
      : workspace.name;
  const cleanSlug =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pernikahan";
  const invitationSlug = `${cleanSlug}-${workspaceId.slice(0, 6)}`;

  await db
    .update(weddingWorkspaces)
    .set({ invitationSlug })
    .where(eq(weddingWorkspaces.id, workspaceId));

  revalidatePath("/guests");
  revalidatePath("/dashboard");

  const [updated] = await db
    .select()
    .from(weddingWorkspaces)
    .where(eq(weddingWorkspaces.id, workspaceId))
    .limit(1);

  return updated;
}

