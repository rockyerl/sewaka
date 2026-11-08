import "server-only";

import { asc, eq } from "drizzle-orm";
import { culturalRundowns, weddingWorkspaces } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
} from "@/lib/constants/cultural-templates";

export async function listWorkspaceRundowns(workspaceId: string, userId?: string) {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    return tx
      .select()
      .from(culturalRundowns)
      .where(eq(culturalRundowns.workspaceId, workspaceId))
      .orderBy(asc(culturalRundowns.sortOrder), asc(culturalRundowns.timeStart));
  });
}

export async function getWorkspaceCulturalInfo(workspaceId: string, userId?: string) {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    const [ws] = await tx
      .select({
        id: weddingWorkspaces.id,
        name: weddingWorkspaces.name,
        coupleOne: weddingWorkspaces.coupleOne,
        coupleTwo: weddingWorkspaces.coupleTwo,
        weddingDate: weddingWorkspaces.weddingDate,
        location: weddingWorkspaces.location,
        culturalTradition: weddingWorkspaces.culturalTradition,
        invitationSlug: weddingWorkspaces.invitationSlug,
        invitationQuote: weddingWorkspaces.invitationQuote,
        dressCode: weddingWorkspaces.dressCode,
        story: weddingWorkspaces.story,
      })
      .from(weddingWorkspaces)
      .where(eq(weddingWorkspaces.id, workspaceId))
      .limit(1);

    const tradition = (ws?.culturalTradition ?? "JAWA") as CulturalTradition;
    const traditionInfo = CULTURAL_TRADITIONS[tradition] ?? CULTURAL_TRADITIONS.JAWA;

    return {
      workspace: ws,
      traditionInfo,
    };
  });
}
