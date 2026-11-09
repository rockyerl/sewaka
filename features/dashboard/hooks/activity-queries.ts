import { getCurrentUser } from "@/lib/auth-cache";
import { eq, desc } from "drizzle-orm";
import { activityLogs, users } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export async function listActivityLogs(limit = 50) {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
        actorName: users.name,
        actorEmail: users.email,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.actorId, users.id))
      .where(eq(activityLogs.workspaceId, workspaceId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  });
}

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>,
) {
  const sessionUser = await getCurrentUser();
  const userId = sessionUser?.id ?? null;

  return withWorkspace(async (tx, workspaceId) => {
    await tx.insert(activityLogs).values({
      workspaceId,
      actorId: userId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? null,
    });
  });
}
