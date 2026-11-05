"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { activityLogs, tasks, weddingWorkspaces } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";
import { changeTaskSchema, taskFormSchema, updateTaskSchema } from "../schemas/task";
import { CHECKLIST_MILESTONE_TEMPLATES } from "../constants/checklist-templates";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function createTaskAction(formData: FormData) {
  const priorityRaw = formData.get("priority");
  const input = taskFormSchema.parse({
    workspaceId: formData.get("workspaceId"),
    title: formData.get("title"),
    description: String(formData.get("description") ?? "") || undefined,
    dueDate: String(formData.get("dueDate") ?? "") || undefined,
  });

  const priority = typeof priorityRaw === "string" && ["LOW", "MEDIUM", "HIGH"].includes(priorityRaw) ? priorityRaw : "MEDIUM";

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      await transaction.insert(tasks).values({
        workspaceId: input.workspaceId,
        title: input.title,
        description: input.description || null,
        dueDate: input.dueDate,
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
      });
    },
  );

  revalidatePath("/");
}

export async function toggleTaskAction(formData: FormData) {
  const input = changeTaskSchema.parse({
    workspaceId: formData.get("workspaceId"),
    taskId: formData.get("taskId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const [task] = await transaction
        .select({ status: tasks.status })
        .from(tasks)
        .where(
          and(eq(tasks.id, input.taskId), eq(tasks.workspaceId, input.workspaceId)),
        )
        .limit(1);

      if (!task) {
        throw new Error("Tugas tidak ditemukan di workspace ini.");
      }

      await transaction
        .update(tasks)
        .set({ status: task.status === "COMPLETED" ? "TODO" : "COMPLETED" })
        .where(
          and(eq(tasks.id, input.taskId), eq(tasks.workspaceId, input.workspaceId)),
        );
    },
  );

  revalidatePath("/");
}

export async function deleteTaskAction(formData: FormData) {
  const input = changeTaskSchema.parse({
    workspaceId: formData.get("workspaceId"),
    taskId: formData.get("taskId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const deleted = await transaction
        .delete(tasks)
        .where(
          and(eq(tasks.id, input.taskId), eq(tasks.workspaceId, input.workspaceId)),
        )
        .returning({ id: tasks.id });

      if (deleted.length === 0) {
        throw new Error("Tugas tidak ditemukan di workspace ini.");
      }
    },
  );

  revalidatePath("/");
}

export async function applyChecklistTemplateAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const milestone = String(formData.get("milestone") ?? "");

  if (!workspaceId) {
    throw new Error("workspaceId diperlukan");
  }

  await withWorkspace(
    { workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const [workspace] = await transaction
        .select({ weddingDate: weddingWorkspaces.weddingDate })
        .from(weddingWorkspaces)
        .where(eq(weddingWorkspaces.id, workspaceId))
        .limit(1);

      const baseDate = workspace?.weddingDate ? new Date(workspace.weddingDate) : new Date();

      const templatesToApply =
        milestone === "ALL"
          ? CHECKLIST_MILESTONE_TEMPLATES
          : CHECKLIST_MILESTONE_TEMPLATES.filter((t) => t.milestone === milestone);

      // Check existing tasks to prevent duplicates
      const existing = await transaction
        .select({ title: tasks.title })
        .from(tasks)
        .where(eq(tasks.workspaceId, workspaceId));
      const existingTitles = new Set(existing.map((t) => t.title));

      let insertedCount = 0;
      for (const t of templatesToApply) {
        for (const item of t.tasks) {
          const fullTitle = `[${t.milestone}] ${item.title}`;
          if (existingTitles.has(fullTitle)) {
            continue;
          }

          const taskDueDate = workspace?.weddingDate
            ? new Date(baseDate.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
            : null;

          await transaction.insert(tasks).values({
            workspaceId,
            title: fullTitle,
            description: item.description ?? null,
            dueDate: taskDueDate,
            priority: item.priority,
            status: "TODO",
          });
          insertedCount++;
        }
      }

      if (insertedCount > 0) {
        await transaction.insert(activityLogs).values({
          workspaceId,
          action: "APPLY_CHECKLIST_TEMPLATE",
          entityType: "TASK",
          metadata: {
            milestone,
            insertedCount,
          },
        });
      }
    },
  );

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function updateTaskAction(formData: FormData) {
  const input = updateTaskSchema.parse({
    workspaceId: formData.get("workspaceId"),
    taskId: formData.get("taskId"),
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const updates: any = {};
      if (input.status) updates.status = input.status;
      if (input.priority) updates.priority = input.priority;

      if (Object.keys(updates).length > 0) {
        await transaction
          .update(tasks)
          .set(updates)
          .where(
            and(eq(tasks.id, input.taskId), eq(tasks.workspaceId, input.workspaceId)),
          );
      }
    },
  );

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/");
}
