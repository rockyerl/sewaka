import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { invitationCustomization } from "@/lib/db/schema";

export async function getInvitationCustomByWorkspace(workspaceId: string) {
  const db = await getDb();
  const [custom] = await db
    .select()
    .from(invitationCustomization)
    .where(eq(invitationCustomization.workspaceId, workspaceId));
  return custom ?? null;
}

export async function getInvitationCustomByWorkspacePublic(workspaceId: string) {
  const db = await getDb();
  const [custom] = await db
    .select()
    .from(invitationCustomization)
    .where(eq(invitationCustomization.workspaceId, workspaceId));
  if (!custom || !custom.enabled) return null;
  return custom;
}
