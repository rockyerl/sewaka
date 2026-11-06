"use server";

import { eq, and, lte, asc, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications, tasks, expenses, budgets, weddingEvents } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

/**
 * Schedule task reminders for tasks due within 24 hours (TSK-08)
 */
export async function scheduleTaskReminders() {
  try {
    const db = getDb();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find tasks due within 24 hours that are not completed
    const dueTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        assignedToId: tasks.assignedToId,
        workspaceId: tasks.workspaceId,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "TODO"),
          lte(tasks.dueDate, tomorrow),
          gte(tasks.dueDate, now)
        )
      )
      .orderBy(asc(tasks.dueDate));

    for (const task of dueTasks) {
      // Create notification
      await db.insert(notifications).values({
        workspaceId: task.workspaceId,
        userId: task.assignedToId ?? "00000000-0000-0000-0000-000000000000",
        type: "TASK_REMINDER",
        title: `Tugas hampir jatuh tempo: ${task.title}`,
        message: `Tugas "${task.title}" akan jatuh tempo dalam 24 jam.`,
        read: "UNREAD",
      });
    }

    return { processed: dueTasks.length, error: null };
  } catch (error) {
    logger.error("Task reminder scheduler failed", error);
    return { processed: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Schedule budget alerts when expenses exceed 80% of budget (BGT-09)
 */
export async function scheduleBudgetAlerts() {
  try {
    const db = getDb();
    const budgetsList = await db.select().from(budgets);

    for (const budget of budgetsList) {
      const totalAmount = Number(budget.totalAmount || 0);
      if (totalAmount === 0) continue;

      // Calculate total expenses
      const expensesList = await db
        .select({ amount: expenses.amount })
        .from(expenses)
        .where(eq(expenses.workspaceId, budget.workspaceId));

      const totalExpenses = expensesList.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
      );

      const percentage = (totalExpenses / totalAmount) * 100;

      // Alert if exceeding 80%
      if (percentage >= 80) {
        await db.insert(notifications).values({
          workspaceId: budget.workspaceId,
          userId: "00000000-0000-0000-0000-000000000000",
          type: "BUDGET_ALERT",
          title: "Peringatan Anggaran",
          message: `Pengeluaran sudah mencapai ${percentage.toFixed(0)}% dari total anggaran.`,
          read: "UNREAD",
        });
      }
    }

    return { processed: budgetsList.length, error: null };
  } catch (error) {
    logger.error("Budget alert scheduler failed", error);
    return { processed: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Schedule event reminders for events within 48 hours (CAL-05)
 */
export async function scheduleEventReminders() {
  try {
    const db = getDb();
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find events within 48 hours
    const upcomingEvents = await db
      .select({
        id: weddingEvents.id,
        name: weddingEvents.name,
        eventDate: weddingEvents.eventDate,
        workspaceId: weddingEvents.workspaceId,
      })
      .from(weddingEvents)
      .where(
        and(
          lte(weddingEvents.eventDate, in48Hours),
          gte(weddingEvents.eventDate, now)
        )
      )
      .orderBy(asc(weddingEvents.eventDate));

    for (const event of upcomingEvents) {
      // Create notification
      await db.insert(notifications).values({
        workspaceId: event.workspaceId,
        userId: "00000000-0000-0000-0000-000000000000",
        type: "SYSTEM",
        title: `Acara segera: ${event.name}`,
        message: `Acara "${event.name}" akan berlangsung dalam 48 jam.`,
        read: "UNREAD",
      });
    }

    return { processed: upcomingEvents.length, error: null };
  } catch (error) {
    logger.error("Event reminder scheduler failed", error);
    return { processed: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Run all scheduled notifications (no auth required - for cron jobs)
 */
export async function runNotificationScheduler() {
  const [taskResult, budgetResult, eventResult] = await Promise.all([
    scheduleTaskReminders(),
    scheduleBudgetAlerts(),
    scheduleEventReminders(),
  ]);

  return {
    tasks: taskResult,
    budgets: budgetResult,
    events: eventResult,
    runAt: new Date(),
  };
}
