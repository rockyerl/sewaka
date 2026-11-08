"use server";

import { auth } from "@/lib/actions/auth";
import { getDb } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { recurringTasks, tasks } from "@/lib/db/schema";
import { z } from "zod";

const createRecurringTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  categoryId: z.string().uuid().optional().nullable(),
  recurrencePattern: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
  recurrenceInterval: z.number().int().positive().default(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

export async function createRecurringTaskAction(data: z.infer<typeof createRecurringTaskSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = createRecurringTaskSchema.parse(data);
  const db = await getDb();
  const [result] = await db
    .insert(recurringTasks)
    .values(parsed)
    .returning();

  return result;
}

export async function updateRecurringTaskAction(id: string, data: Partial<typeof recurringTasks.$inferInsert>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const [result] = await db
    .update(recurringTasks)
    .set(data)
    .where(eq(recurringTasks.id, id))
    .returning();

  return result;
}

export async function deleteRecurringTaskAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  await db
    .delete(recurringTasks)
    .where(eq(recurringTasks.id, id));
}

export async function listRecurringTasksAction(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  return db
    .select()
    .from(recurringTasks)
    .where(eq(recurringTasks.workspaceId, workspaceId))
    .orderBy(desc(recurringTasks.createdAt));
}

export async function generateTasksFromRecurringAction(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const recurring = await db
    .select()
    .from(recurringTasks)
    .where(and(
      eq(recurringTasks.workspaceId, workspaceId),
      eq(recurringTasks.isActive, true)
    ));

  let generatedCount = 0;
  const now = new Date();

  for (const task of recurring) {
    // Calculate next due date based on recurrence pattern
    let nextDate = task.lastGeneratedAt || task.startDate;
    if (nextDate >= now) continue;

    while (nextDate < now) {
      switch (task.recurrencePattern) {
        case "DAILY":
          nextDate = new Date(nextDate.getTime() + task.recurrenceInterval * 24 * 60 * 60 * 1000);
          break;
        case "WEEKLY":
          nextDate = new Date(nextDate.getTime() + task.recurrenceInterval * 7 * 24 * 60 * 60 * 1000);
          break;
        case "BIWEEKLY":
          nextDate = new Date(nextDate.getTime() + task.recurrenceInterval * 14 * 24 * 60 * 60 * 1000);
          break;
        case "MONTHLY":
          nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + task.recurrenceInterval, nextDate.getDate());
          break;
      }

      // Stop if past end date
      if (task.endDate && nextDate > task.endDate) break;

      // Create actual task
      await db.insert(tasks).values({
        workspaceId,
        title: task.title,
        description: task.description,
        notes: task.notes,
        priority: task.priority,
        categoryId: task.categoryId,
        dueDate: nextDate,
        status: "TODO",
      });

      generatedCount++;
    }

    // Update last generated timestamp
    if (generatedCount > 0) {
      await db
        .update(recurringTasks)
        .set({ lastGeneratedAt: nextDate })
        .where(eq(recurringTasks.id, task.id));
    }
  }

  return { generatedCount };
}
