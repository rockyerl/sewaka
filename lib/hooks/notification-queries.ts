import "server-only";

import { and, eq } from "drizzle-orm";
import { notifications } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export async function markAsRead(notificationId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .update(notifications)
      .set({ read: "READ" })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.workspaceId, workspaceId),
        ),
      );
  });
}

export async function markAllAsRead() {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .update(notifications)
      .set({ read: "READ" })
      .where(
        and(
          eq(notifications.workspaceId, workspaceId),
          eq(notifications.read, "UNREAD"),
        ),
      );
  });
}
