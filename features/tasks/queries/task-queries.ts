import "server-only";

import { asc, desc, sql } from "drizzle-orm";

import { withWorkspace } from "@/db/with-workspace";
import { tasks } from "@/db/schema";

export type WorkspaceTask = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
};

export async function listWorkspaceTasks(
  workspaceId: string,
  userId?: string,
): Promise<WorkspaceTask[]> {
  return withWorkspace({ workspaceId, userId: userId }, async (transaction) =>
    transaction
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .orderBy(sql`${tasks.dueDate} asc nulls last`, desc(tasks.createdAt), asc(tasks.title)),
  );
}
