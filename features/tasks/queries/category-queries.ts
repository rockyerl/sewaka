import { eq, and } from "drizzle-orm";
import { taskCategories, tasks } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";
import type { CreateTaskCategoryInput, UpdateTaskCategoryInput } from "@/features/tasks/schemas/category";

export async function listTaskCategories() {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select()
      .from(taskCategories)
      .where(eq(taskCategories.workspaceId, workspaceId))
      .orderBy(taskCategories.createdAt);
  });
}

export async function getTaskCategory(categoryId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    const [found] = await tx
      .select()
      .from(taskCategories)
      .where(
        and(
          eq(taskCategories.id, categoryId),
          eq(taskCategories.workspaceId, workspaceId),
        ),
      );
    return found;
  });
}

export async function createTaskCategory(input: CreateTaskCategoryInput) {
  return withWorkspace(async (tx, workspaceId) => {
    const [created] = await tx
      .insert(taskCategories)
      .values({
        workspaceId,
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? null,
      })
      .returning();
    return created;
  });
}

export async function updateTaskCategory(
  categoryId: string,
  input: UpdateTaskCategoryInput,
) {
  return withWorkspace(async (tx, workspaceId) => {
    const [updated] = await tx
      .update(taskCategories)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.color !== undefined && { color: input.color }),
      })
      .where(
        and(
          eq(taskCategories.id, categoryId),
          eq(taskCategories.workspaceId, workspaceId),
        ),
      )
      .returning();
    return updated;
  });
}

export async function deleteTaskCategory(categoryId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .delete(taskCategories)
      .where(
        and(
          eq(taskCategories.id, categoryId),
          eq(taskCategories.workspaceId, workspaceId),
        ),
      );
  });
}

export async function getTasksByCategory(categoryId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.workspaceId, workspaceId),
          eq(tasks.categoryId, categoryId),
        ),
      )
      .orderBy(tasks.dueDate);
  });
}
