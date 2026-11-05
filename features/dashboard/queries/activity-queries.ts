import { auth } from "@/auth";
import { eq, desc } from "drizzle-orm";
import { activityLogs, users } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

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
  const session = await auth();
  const userId = session?.user?.id ?? null;

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
