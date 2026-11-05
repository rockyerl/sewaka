"use server";

import { auth } from "@/auth";
import { getDb } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { supportTickets, supportTicketMessages } from "@/db/schema";
import { z } from "zod";

const createSupportTicketSchema = z.object({
  workspaceId: z.string().uuid().optional().nullable(),
  subject: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z.enum(["BILLING", "TECHNICAL", "FEATURE_REQUEST", "OTHER"]).default("OTHER"),
});

export async function createSupportTicketAction(data: z.infer<typeof createSupportTicketSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = createSupportTicketSchema.parse(data);
  const db = await getDb();
  const [ticket] = await db
    .insert(supportTickets)
    .values({
      ...parsed,
      userId: session.user.id,
    })
    .returning();

  // Add initial message
  await db.insert(supportTicketMessages).values({
    ticketId: ticket.id,
    userId: session.user.id,
    message: parsed.message,
    isInternal: false,
  });

  return ticket;
}

export async function addSupportMessageAction(ticketId: string, message: string, isInternal = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const [result] = await db
    .insert(supportTicketMessages)
    .values({
      ticketId,
      userId: session.user.id,
      message,
      isInternal,
    })
    .returning();

  return result;
}

export async function updateSupportTicketStatusAction(ticketId: string, status: string, assignedToId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updates: any = { status };
  if (assignedToId) updates.assignedToId = assignedToId;
  if (status === "RESOLVED" || status === "CLOSED") updates.resolvedAt = new Date();

  const db = await getDb();
  const [result] = await db
    .update(supportTickets)
    .set(updates)
    .where(eq(supportTickets.id, ticketId))
    .returning();

  return result;
}

export async function getSupportTicketAction(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const ticket = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);

  const messages = await db
    .select()
    .from(supportTicketMessages)
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(desc(supportTicketMessages.createdAt));

  return { ticket: ticket[0], messages };
}

export async function listUserSupportTicketsAction(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function listAllSupportTicketsAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  return db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt));
}
