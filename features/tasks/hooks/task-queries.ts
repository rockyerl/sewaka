import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { withWorkspace } from "@/lib/db/with-workspace";
import { tasks, taskCategories } from "@/lib/db/schema";

export type WorkspaceTask = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
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
        categoryId: tasks.categoryId,
        categoryName: taskCategories.name,
        categoryColor: taskCategories.color,
      })
      .from(tasks)
      .leftJoin(taskCategories, eq(tasks.categoryId, taskCategories.id))
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(sql`${tasks.dueDate} asc nulls last`, desc(tasks.createdAt), asc(tasks.title)),
  );
}
