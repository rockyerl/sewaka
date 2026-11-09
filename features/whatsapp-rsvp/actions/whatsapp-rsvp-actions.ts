"use server";

import { eq, and, count, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { whatsappMessages, guests, weddingWorkspaces } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const sendWaMessageSchema = z.object({
  workspaceId: z.string().uuid(),
  guestId: z.string().uuid(),
  phoneNumber: z.string().min(1),
  messageType: z.enum(["INVITE", "REMINDER_7D", "REMINDER_1D", "CUSTOM"]),
  messageTemplate: z.string().min(1),
});

const bulkSendWaMessageSchema = z.object({
  workspaceId: z.string().uuid(),
  guestIds: z.array(z.string().uuid()).min(1).max(50),
  messageType: z.enum(["INVITE", "REMINDER_7D", "REMINDER_1D", "CUSTOM"]),
  messageTemplate: z.string().min(1),
});

export interface WaMessageResult {
  success: boolean;
  messageId?: string;
  waLink?: string;
  error?: string;
}

export interface WaStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

/**
 * Kirim pesan WhatsApp ke tamu dan simpan tracking di database.
 */
export async function sendWaMessageAction(data: {
  workspaceId: string;
  guestId: string;
  phoneNumber: string;
  messageType: "INVITE" | "REMINDER_7D" | "REMINDER_1D" | "CUSTOM";
  messageTemplate: string;
}): Promise<WaMessageResult> {
  const input = sendWaMessageSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      // Get guest info
      const [guest] = await tx
        .select({ name: guests.name, phone: guests.phone })
        .from(guests)
        .where(and(eq(guests.id, input.guestId), eq(guests.workspaceId, input.workspaceId)));

      if (!guest) {
        return { success: false, error: "Tamu tidak ditemukan." };
      }

      // Get workspace info for invitation slug
      const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
      const workspace = await getCurrentWorkspace(input.workspaceId);
      if (!workspace) {
        return { success: false, error: "Workspace tidak ditemukan." };
      }

      // Build message with personalization
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const coupleName =
        workspace.coupleOne && workspace.coupleTwo
          ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
          : workspace.name;

      let message = input.messageTemplate
        .replace(/{guest_name}/g, guest.name)
        .replace(/{couple_name}/g, coupleName);

      if (workspace.invitationSlug) {
        const inviteLink = `${baseUrl}/invitation/${workspace.invitationSlug}?to=${encodeURIComponent(guest.name)}`;
        message = message.replace(/{invite_link}/g, inviteLink);
      } else {
        message = message.replace(/{invite_link}/g, "");
      }

      // Generate WhatsApp link
      const cleanPhone = input.phoneNumber.replace(/[^0-9]/g, "");
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      // Save tracking record
      const [newMessage] = await tx
        .insert(whatsappMessages)
        .values({
          workspaceId: input.workspaceId,
          guestId: input.guestId,
          phoneNumber: cleanPhone,
          messageType: input.messageType,
          messageTemplate: message,
          status: "SENT",
          sentAt: new Date(),
        })
        .returning({ id: whatsappMessages.id });

      revalidatePath("/whatsapp-rsvp");

      return {
        success: true,
        messageId: newMessage?.id,
        waLink,
      };
    }
  );
}

/**
 * Bulk kirim pesan WhatsApp ke banyak tamu.
 * Rate limited to 50 guests per batch.
 */
export async function bulkSendWaMessageAction(data: {
  workspaceId: string;
  guestIds: string[];
  messageType: "INVITE" | "REMINDER_7D" | "REMINDER_1D" | "CUSTOM";
  messageTemplate: string;
}): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  const input = bulkSendWaMessageSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      // Get workspace info
      const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
      const workspace = await getCurrentWorkspace(input.workspaceId);
      if (!workspace) {
        return { success: false, sent: 0, failed: 0, error: "Workspace tidak ditemukan." };
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const coupleName =
        workspace.coupleOne && workspace.coupleTwo
          ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
          : workspace.name;

      // Fetch guests
      const guestRows = await tx
        .select({
          id: guests.id,
          name: guests.name,
          phone: guests.phone,
        })
        .from(guests)
        .where(and(eq(guests.workspaceId, input.workspaceId), inArray(guests.id, input.guestIds)));
      const guestsById = new Map(guestRows.map((guest) => [guest.id, guest]));

      // Build message template
      let message = input.messageTemplate
        .replace(/{couple_name}/g, coupleName);

      if (workspace.invitationSlug) {
        message = message.replace(
          /{invite_link}/g,
          `${baseUrl}/invitation/${workspace.invitationSlug}?to={guest_name}`
        );
      } else {
        message = message.replace(/{invite_link}/g, "");
      }

      let sent = 0;
      let failed = 0;

      for (const guestId of input.guestIds) {
        try {
          const guest = guestsById.get(guestId);

          if (!guest || !guest.phone) {
            failed++;
            continue;
          }

          const personalizedMessage = message.replace(/{guest_name}/g, guest.name);
          const cleanPhone = guest.phone.replace(/[^0-9]/g, "");

          await tx.insert(whatsappMessages).values({
            workspaceId: input.workspaceId,
            guestId,
            phoneNumber: cleanPhone,
            messageType: input.messageType,
            messageTemplate: personalizedMessage,
            status: "SENT",
            sentAt: new Date(),
          });

          sent++;
        } catch {
          failed++;
        }
      }

      revalidatePath("/whatsapp-rsvp");

      return {
        success: sent > 0,
        sent,
        failed,
      };
    }
  );
}

/**
 * Get WhatsApp message stats untuk dashboard.
 */
export async function getWaMessageStatsAction(
  workspaceId: string
): Promise<WaStats> {
  const [stats] = await withWorkspace({ workspaceId }, (db) => db
    .select({
      total: count(),
      sent: count(eq(whatsappMessages.status, "SENT")),
      delivered: count(eq(whatsappMessages.status, "DELIVERED")),
      read: count(eq(whatsappMessages.status, "READ")),
      failed: count(eq(whatsappMessages.status, "FAILED")),
      pending: count(eq(whatsappMessages.status, "PENDING")),
    })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.workspaceId, workspaceId)));

  return {
    total: stats?.total ?? 0,
    sent: stats?.sent ?? 0,
    delivered: stats?.delivered ?? 0,
    read: stats?.read ?? 0,
    failed: stats?.failed ?? 0,
    pending: stats?.pending ?? 0,
  };
}

/**
 * Get WhatsApp message history untuk dashboard.
 */
export async function getWaMessageHistoryAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, (db) => db
    .select({
      id: whatsappMessages.id,
      guestName: guests.name,
      phoneNumber: whatsappMessages.phoneNumber,
      messageType: whatsappMessages.messageType,
      status: whatsappMessages.status,
      sentAt: whatsappMessages.sentAt,
      deliveredAt: whatsappMessages.deliveredAt,
      readAt: whatsappMessages.readAt,
      errorMessage: whatsappMessages.errorMessage,
    })
    .from(whatsappMessages)
    .leftJoin(guests, eq(whatsappMessages.guestId, guests.id))
    .where(eq(whatsappMessages.workspaceId, workspaceId))
    .orderBy(desc(whatsappMessages.sentAt))
    .limit(50));
}

/**
 * Schedule reminder untuk tamu yang belum RSVP.
 */
export async function scheduleReminderAction(
  workspaceId: string,
  daysBefore: number
): Promise<{ success: boolean; scheduled: number; error?: string }> {
  return withWorkspace(
    { workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      // Get workspace wedding date
      const [workspace] = await tx
        .select({ weddingDate: weddingWorkspaces.weddingDate })
        .from(weddingWorkspaces)
        .where(eq(weddingWorkspaces.id, workspaceId));

      if (!workspace?.weddingDate) {
        return { success: false, scheduled: 0, error: "Tanggal pernikahan belum diatur." };
      }

      // Calculate reminder date
      const reminderDate = new Date(workspace.weddingDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);

      // Find guests who haven't RSVP and haven't been reminded
      const pendingGuests = await tx
        .select({
          id: guests.id,
          name: guests.name,
          phone: guests.phone,
        })
        .from(guests)
        .where(
          and(
            eq(guests.workspaceId, workspaceId),
            eq(guests.rsvpStatus, "PENDING")
          )
        );

      if (pendingGuests.length === 0) {
        return { success: true, scheduled: 0 };
      }

      const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
      const ws = await getCurrentWorkspace(workspaceId);
      if (!ws) {
        return { success: false, scheduled: 0, error: "Workspace tidak ditemukan." };
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const coupleName =
        ws.coupleOne && ws.coupleTwo
          ? `${ws.coupleOne} & ${ws.coupleTwo}`
          : ws.name;

      const inviteLink = ws.invitationSlug
        ? `${baseUrl}/invitation/${ws.invitationSlug}`
        : "";

      const messageType = daysBefore === 7 ? "REMINDER_7D" : "REMINDER_1D";
      const messageTemplate = `Halo {guest_name}! Ini pengingat bahwa pernikahan ${coupleName} akan segera hadir dalam ${daysBefore} hari lagi. Mohon konfirmasi kehadiran Anda di ${inviteLink}. Terima kasih!`;

      let scheduled = 0;

      for (const guest of pendingGuests) {
        if (!guest.phone) continue;

        const personalizedMessage = messageTemplate.replace(/{guest_name}/g, guest.name);
        const cleanPhone = guest.phone.replace(/[^0-9]/g, "");

        await tx.insert(whatsappMessages).values({
          workspaceId,
          guestId: guest.id,
          phoneNumber: cleanPhone,
          messageType,
          messageTemplate: personalizedMessage,
          status: "PENDING",
        });

        scheduled++;
      }

      revalidatePath("/whatsapp-rsvp");

      return { success: true, scheduled };
    }
  );
}
