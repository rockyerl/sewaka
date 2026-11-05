import { and, desc, eq, inArray } from "drizzle-orm";
import {
  budgetCategories,
  expenses,
  guests,
  notifications,
  tasks,
  workspaceMembers,
} from "@/db/schema";
import { withWorkspace, type WorkspaceTransaction } from "@/db/with-workspace";

async function syncWorkspaceReminders(
  tx: WorkspaceTransaction,
  workspaceId: string,
) {
  try {
    // 1. Get workspace user to assign notifications
    const [member] = await tx
      .select({ userId: workspaceMembers.userId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .limit(1);

    if (!member?.userId) {
      return;
    }
    const userId = member.userId;

    // 2. Fetch existing notifications to avoid duplicates
    const existingNotifications = await tx
      .select({
        entityId: notifications.entityId,
        type: notifications.type,
      })
      .from(notifications)
      .where(eq(notifications.workspaceId, workspaceId));

    const existingKeys = new Set(
      existingNotifications
        .filter((n: { entityId: string | null; type: string }) => Boolean(n.entityId))
        .map((n: { entityId: string | null; type: string }) => `${n.type}_${n.entityId}`),
    );

    // 3. Check nearest task deadlines (due in next 7 days or overdue, and not completed)
    const allTasks = await tx
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        status: tasks.status,
      })
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId));

    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const t of allTasks) {
      if (t.status === "COMPLETED" || !t.dueDate) continue;
      const due = new Date(t.dueDate);
      if (due <= next7Days) {
        const key = `DUE_DATE_${t.id}`;
        if (!existingKeys.has(key)) {
          const isOverdue = due < now;
          const dueFormatted = new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(due);

          await tx.insert(notifications).values({
            workspaceId,
            userId,
            type: "DUE_DATE",
            title: isOverdue ? `Tenggat Terlewat: ${t.title}` : `Tenggat Terdekat: ${t.title}`,
            message: isOverdue
              ? `Tugas telah melewati tenggat (${dueFormatted}). Segera tuntaskan persiapan ini!`
              : `Tugas jatuh tempo pada ${dueFormatted}. Mohon pastikan koordinasi berjalan lancar.`,
            read: "UNREAD",
            entityType: "task",
            entityId: t.id,
          });
          existingKeys.add(key);
        }
      }
    }

    // 4. Check budget overruns (categories where total actual expenses > allocated budget)
    const categories = await tx
      .select({
        id: budgetCategories.id,
        name: budgetCategories.name,
        allocatedAmount: budgetCategories.allocatedAmount,
      })
      .from(budgetCategories)
      .where(eq(budgetCategories.workspaceId, workspaceId));

    const allExpenses = await tx
      .select({
        categoryId: expenses.categoryId,
        amount: expenses.amount,
      })
      .from(expenses)
      .where(eq(expenses.workspaceId, workspaceId));

    const categorySpend: Record<string, number> = {};
    for (const exp of allExpenses) {
      if (exp.categoryId) {
        categorySpend[exp.categoryId] =
          (categorySpend[exp.categoryId] || 0) + Number(exp.amount || 0);
      }
    }

    for (const cat of categories) {
      const allocated = Number(cat.allocatedAmount || 0);
      const spent = categorySpend[cat.id] || 0;
      if (allocated > 0 && spent > allocated) {
        const key = `BUDGET_ALERT_${cat.id}`;
        if (!existingKeys.has(key)) {
          const diff = spent - allocated;
          await tx.insert(notifications).values({
            workspaceId,
            userId,
            type: "BUDGET_ALERT",
            title: `Batas Anggaran Membengkak: ${cat.name}`,
            message: `Realisasi Rp ${spent.toLocaleString("id-ID")} melampaui batas alokasi Rp ${allocated.toLocaleString("id-ID")} (Selisih +Rp ${diff.toLocaleString("id-ID")}).`,
            read: "UNREAD",
            entityType: "budget",
            entityId: cat.id,
          });
          existingKeys.add(key);
        }
      }
    }

    // 5. Check guest RSVPs (recent responses that are ACCEPTED or DECLINED)
    const allGuests = await tx
      .select({
        id: guests.id,
        name: guests.name,
        rsvpStatus: guests.rsvpStatus,
        plusOnes: guests.plusOnes,
      })
      .from(guests)
      .where(eq(guests.workspaceId, workspaceId));

    for (const g of allGuests) {
      if (g.rsvpStatus === "ACCEPTED" || g.rsvpStatus === "DECLINED") {
        const key = `INVITATION_${g.id}`;
        if (!existingKeys.has(key)) {
          const statusText = g.rsvpStatus === "ACCEPTED" ? "HADIR" : "TIDAK HADIR";
          const plusText = g.plusOnes > 0 ? ` (+${g.plusOnes} pendamping)` : "";
          await tx.insert(notifications).values({
            workspaceId,
            userId,
            type: "INVITATION",
            title: `Konfirmasi Kehadiran: ${g.name}`,
            message: `${g.name} telah mengonfirmasi ${statusText}${plusText} melalui undangan digital.`,
            read: "UNREAD",
            entityType: "guest",
            entityId: g.id,
          });
          existingKeys.add(key);
        }
      }
    }
  } catch (err) {
    console.error("Failed to sync workspace reminders:", err);
  }
}

export async function listNotifications(workspaceId?: string) {
  if (workspaceId) {
    return withWorkspace({ workspaceId }, async (tx) => {
      await syncWorkspaceReminders(tx, workspaceId);
      return tx
        .select()
        .from(notifications)
        .where(eq(notifications.workspaceId, workspaceId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    });
  }

  return withWorkspace(async (tx, wsId) => {
    await syncWorkspaceReminders(tx, wsId);
    return tx
      .select()
      .from(notifications)
      .where(eq(notifications.workspaceId, wsId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  });
}

export async function getUnreadCount(workspaceId?: string) {
  if (workspaceId) {
    return withWorkspace({ workspaceId }, async (tx) => {
      const result = await tx
        .select({ count: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.workspaceId, workspaceId),
            eq(notifications.read, "UNREAD"),
          ),
        );
      return result.length;
    });
  }
  return withWorkspace(async (tx, wsId) => {
    const result = await tx
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.workspaceId, wsId),
          eq(notifications.read, "UNREAD"),
        ),
      );
    return result.length;
  });
}

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
