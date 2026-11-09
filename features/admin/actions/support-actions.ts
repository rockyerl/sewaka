"use server";

import { auth } from "@/lib/actions/auth";
import { getDb } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { supportTickets, supportTicketMessages, users, workspaceMembers } from "@/lib/db/schema";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { logAdminAction } from "@/features/admin/lib/audit";
import { z } from "zod";

const createSupportTicketSchema = z.object({
  workspaceId: z.string().uuid().optional().nullable(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(10000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z.enum(["BILLING", "TECHNICAL", "FEATURE_REQUEST", "OTHER"]).default("OTHER"),
});

export async function createSupportTicketAction(data: z.infer<typeof createSupportTicketSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = createSupportTicketSchema.parse(data);
  const db = await getDb();
  if (parsed.workspaceId) {
    const [membership] = await db.select({ id: workspaceMembers.id }).from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, parsed.workspaceId), eq(workspaceMembers.userId, session.user.id))).limit(1);
    if (!membership) throw new Error("Forbidden workspace");
  }
  const ticket = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(supportTickets)
      .values({ ...parsed, userId: session.user.id })
      .returning();
    await tx.insert(supportTicketMessages).values({
      ticketId: created.id,
      userId: session.user.id,
      message: parsed.message,
      isInternal: false,
    });
    return created;
  });

  return ticket;
}

export async function addSupportMessageAction(ticketId: string, message: string, isInternal = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (typeof message !== "string" || !message.trim()) throw new Error("Message is required");

  const db = await getDb();
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  if (!ticket) throw new Error("Support ticket not found");
  const [actor] = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id)).limit(1);
  const isAdmin = actor?.role === "admin";
  if (isInternal && !isAdmin) throw new Error("Forbidden");
  if (!isAdmin && ticket.userId !== session.user.id) throw new Error("Forbidden");
  const [result] = await db
    .insert(supportTicketMessages)
    .values({
      ticketId,
      userId: session.user.id,
      message: message.trim(),
      isInternal,
    })
    .returning();

  if (actor.role === "admin") await logAdminAction("create", "support_reply", ticket.id, null, { isInternal }, null);
  return result;
}

export async function updateSupportTicketStatusAction(ticketId: string, status: string, assignedToId?: string) {
  const { userId } = await requireAdmin();
  if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) throw new Error("Invalid support ticket status");

  const updates: any = { status, updatedAt: new Date() };
  if (assignedToId !== undefined) updates.assignedToId = assignedToId || null;
  updates.resolvedAt = status === "RESOLVED" || status === "CLOSED" ? new Date() : null;

  const db = await getDb();
  const [existing] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  if (!existing) throw new Error("Support ticket not found");
  if (assignedToId) {
    const [assignee] = await db.select({ role: users.role }).from(users).where(eq(users.id, assignedToId)).limit(1);
    if (assignee?.role !== "admin") throw new Error("Support tickets can only be assigned to an administrator");
  }
  const [result] = await db
    .update(supportTickets)
    .set(updates)
    .where(eq(supportTickets.id, ticketId))
    .returning();

  if (!result) throw new Error("Support ticket not found");
  await logAdminAction("update", "support_ticket", ticketId, { status: existing.status, assignedToId: existing.assignedToId }, { status: result.status, assignedToId: result.assignedToId }, `Updated by ${userId}`);
  return result;
}

export async function getSupportTicketAction(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const [ticket] = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);
  if (!ticket) throw new Error("Support ticket not found");
  if (ticket.userId !== session.user.id) await requireAdmin();

  const messages = await db
    .select()
    .from(supportTicketMessages)
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(desc(supportTicketMessages.createdAt));

  return { ticket, messages: ticket.userId === session.user.id ? messages.filter((item) => !item.isInternal) : messages };
}

export async function listUserSupportTicketsAction(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (userId !== session.user.id) throw new Error("Forbidden");

  const db = await getDb();
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function listAllSupportTicketsAction() {
  await requireAdmin();

  const db = await getDb();
  return db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt));
}
