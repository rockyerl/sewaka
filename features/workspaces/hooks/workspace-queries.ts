import "server-only";

import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth-cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import {
  culturalRundowns,
  tasks,
  weddingWorkspaces,
  workspaceMembers,
} from "@/lib/db/schema";

export { ensureInvitationSlug } from "@/lib/hooks/workspace-queries";


import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
} from "@/lib/constants/cultural-templates";
import {
  createWorkspaceSchema,
  workspaceSummarySchema,
  type WorkspaceSummary,
} from "../actions/workspace-schema";
import type { InferSelectModel } from "drizzle-orm";

type WeddingWorkspace = InferSelectModel<typeof weddingWorkspaces>;

export async function listMyWorkspaces(): Promise<WorkspaceSummary[]> {
  const sessionUser = await getCurrentUser();
  const userId = z.string().uuid().safeParse(sessionUser?.id);

  if (!userId.success) {
    console.error("[listMyWorkspaces] Invalid user ID:", {
      hasSession: !!sessionUser,
      sessionId: sessionUser?.id,
    });
    return [];
  }

  const db = getDb();
  
  // Use direct query instead of SQL function to avoid RLS issues with connection poolers
  // The RLS policy workspace_member_read_by_user allows sewaka_app to read by user_id
  // The RLS policy workspace_owner_read allows reading workspaces where user is a member
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

export async function createWorkspace(input: z.input<typeof createWorkspaceSchema>) {
  const data = createWorkspaceSchema.parse(input);
  const sessionUser = await getCurrentUser();
  const userId = z.string().uuid().parse(sessionUser?.id);
  const workspaceId = randomUUID();

  // Generate unique URL friendly invitation slug
  const baseName =
    data.coupleOne && data.coupleTwo
      ? `${data.coupleOne}-${data.coupleTwo}`
      : data.name;
  const cleanSlug =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pernikahan";
  const invitationSlug = `${cleanSlug}-${workspaceId.slice(0, 6)}`;

  const tradition = (data.culturalTradition ?? "JAWA") as CulturalTradition;
  const traditionInfo = CULTURAL_TRADITIONS[tradition] ?? CULTURAL_TRADITIONS.JAWA;

  return getDb().transaction(async (transaction) => {
    await transaction.execute(sql`
      select
        set_config('app.workspace_id', ${workspaceId}, true),
        set_config('app.user_id', ${userId}, true)
    `);

    try {
      await transaction.insert(weddingWorkspaces).values({
        id: workspaceId,
        name: data.name,
        coupleOne: data.coupleOne,
        coupleTwo: data.coupleTwo,
        weddingDate: data.weddingDate,
        location: data.location,
        totalBudget: data.totalBudget,
        culturalTradition: tradition,
        invitationSlug,
        invitationQuote: traditionInfo.tagline,
        dressCode: traditionInfo.primaryAttire,
      });
    } catch (err) {
      const cause = (err as { cause?: unknown }).cause ?? err;
      console.error("[createWorkspace] workspace insert failed:", JSON.stringify(cause, null, 2));
      throw err;
    }

    try {
      await transaction.insert(workspaceMembers).values({
        workspaceId,
        userId,
        role: "OWNER",
      });
    } catch (err) {
      const cause = (err as { cause?: unknown }).cause ?? err;
      console.error("[createWorkspace] membership insert failed:", JSON.stringify(cause, null, 2));

      // Check if user already has an OWNER membership
      const [existing] = await transaction
        .select({
          workspaceId: workspaceMembers.workspaceId,
          role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, userId))
        .limit(1);

      if (existing) {
        console.error(
          `[createWorkspace] user ${userId} already has membership: workspaceId=${existing.workspaceId}, role=${existing.role}`,
        );
        // Delete the workspace we just created to avoid orphan
        await transaction.delete(weddingWorkspaces).where(eq(weddingWorkspaces.id, workspaceId));
        throw new Error(
          `Anda sudah memiliki workspace sebagai ${existing.role}. Satu user hanya boleh OWNER di satu workspace.`,
        );
      }

      throw err;
    }

    // Seed curated cultural milestone tasks
    const targetDate = data.weddingDate ? new Date(data.weddingDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
    for (const item of traditionInfo.checklistTemplate) {
      const taskDueDate = new Date(targetDate.getTime() + item.offsetDays * 24 * 60 * 60 * 1000);
      await transaction.insert(tasks).values({
        workspaceId,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: "TODO",
        dueDate: taskDueDate,
      });
    }

    // Seed curated cultural rundown items
    for (const item of traditionInfo.rundownTemplate) {
      await transaction.insert(culturalRundowns).values({
        workspaceId,
        title: item.title,
        ceremonyType: item.ceremonyType,
        timeStart: item.timeStart,
        timeEnd: item.timeEnd,
        picName: item.picName,
        location: item.location,
        attire: item.attire,
        rituals: item.rituals,
        notes: item.notes,
        sortOrder: item.sortOrder,
      });
    }

    const [workspace] = await transaction
      .select()
      .from(weddingWorkspaces)
      .where(eq(weddingWorkspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      throw new Error("Created workspace could not be read in its transaction");
    }

    return workspace;
  });
}
