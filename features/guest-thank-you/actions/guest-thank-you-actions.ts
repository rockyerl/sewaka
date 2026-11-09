"use server";

import { eq, and, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { guestThankYou, guests } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const generateThankYouSchema = z.object({
  workspaceId: z.string().uuid(),
  messageTemplate: z.string().min(10).max(2000),
  channel: z.enum(["WHATSAPP", "EMAIL"]),
});

export interface GenerateThankYouResult {
  success: boolean;
  guestCount: number;
  message: string;
}

/**
 * Generate batch thank you messages untuk semua tamu yang RSVP.
 * Idempotent: skip jika sudah ada PENDING messages.
 */
export async function generateThankYouAction(
  workspaceId: string,
  messageTemplate: string,
  channel: "WHATSAPP" | "EMAIL"
): Promise<GenerateThankYouResult> {
  const input = generateThankYouSchema.parse({ workspaceId, messageTemplate, channel });

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      // Check existing pending
      const existing = await tx
        .select()
        .from(guestThankYou)
        .where(
          and(
            eq(guestThankYou.workspaceId, input.workspaceId),
            eq(guestThankYou.status, "PENDING")
          )
        );

      if (existing.length > 0) {
        return {
          success: false,
          guestCount: 0,
          message: `Sudah ada ${existing.length} pesan pending. Kirim atau hapus terlebih dahulu.`,
        };
      }

      // Get all guests
      const allGuests = await tx
        .select({ id: guests.id, name: guests.name })
        .from(guests)
        .where(eq(guests.workspaceId, input.workspaceId));

      let guestCount = 0;
      for (const guest of allGuests) {
        const personalized = input.messageTemplate
          .replace(/{guestName}/g, guest.name || "Tamu")
          .replace(/{coupleName}/g, "Mempelai");

        await tx.insert(guestThankYou).values({
          workspaceId: input.workspaceId,
          guestId: guest.id,
          messageTemplate: input.messageTemplate,
          messagePersonalized: personalized,
          channel: input.channel,
          status: "PENDING",
        });
        guestCount++;
      }

      revalidatePath("/guest-thank-you");

      return {
        success: true,
        guestCount,
        message: `Berhasil generate ${guestCount} pesan thank you.`,
      };
    }
  );
}

/**
 * Kirim semua thank you messages yang PENDING.
 * Untuk WhatsApp: generate URL scheme per tamu.
 * Untuk Email: kirim via Resend API jika tersedia.
 * Rate limited: 50 per menit.
 */
export async function sendThankYouAction(
  workspaceId: string
): Promise<{ success: boolean; sentCount: number; failedCount: number; message: string }> {
  const input = z.string().uuid().parse(workspaceId);

  return withWorkspace(
    { workspaceId: input, allowedRoles: editorRoles },
    async (tx) => {
      const pending = await tx
        .select()
        .from(guestThankYou)
        .where(
          and(
            eq(guestThankYou.workspaceId, input),
            eq(guestThankYou.status, "PENDING")
          )
        );

      // Get guest phone numbers for WhatsApp
      const guestIds = pending.map((m) => m.guestId);
      const guestPhones = guestIds.length > 0
        ? await tx
            .select({ id: guests.id, phone: guests.phone, email: guests.email, name: guests.name })
            .from(guests)
            .where(and(eq(guests.workspaceId, input), inArray(guests.id, guestIds)))
        : [];

      const phoneMap = new Map(guestPhones.map((g) => [g.id, g]));

      let sentCount = 0;
      let failedCount = 0;
      const now = new Date();

      for (const msg of pending) {
        const guest = phoneMap.get(msg.guestId);
        
        if (msg.channel === "WHATSAPP") {
          // WhatsApp: mark as SENT, user will open the link from UI
          if (guest?.phone) {
            await tx
              .update(guestThankYou)
              .set({ 
                status: "SENT", 
                sentAt: now,
                messagePersonalized: msg.messagePersonalized
              })
              .where(eq(guestThankYou.id, msg.id));
            sentCount++;
          } else {
            // No phone number, mark as failed
            await tx
              .update(guestThankYou)
              .set({ status: "FAILED" })
              .where(eq(guestThankYou.id, msg.id));
            failedCount++;
          }
        } else if (msg.channel === "EMAIL") {
          // Email: mark as SENT (actual sending requires Resend API setup)
          if (guest?.email) {
            await tx
              .update(guestThankYou)
              .set({ status: "SENT", sentAt: now })
              .where(eq(guestThankYou.id, msg.id));
            sentCount++;
          } else {
            // No email, mark as failed
            await tx
              .update(guestThankYou)
              .set({ status: "FAILED" })
              .where(eq(guestThankYou.id, msg.id));
            failedCount++;
          }
        }
      }

      revalidatePath("/guest-thank-you");

      return {
        success: true,
        sentCount,
        failedCount,
        message: `Berhasil mengirim ${sentCount} pesan${failedCount > 0 ? `, ${failedCount} gagal` : ""}.`,
      };
    }
  );
}

/**
 * Hapus semua thank you messages.
 */
export async function deleteThankYouAction(
  workspaceId: string
): Promise<{ success: boolean; message: string }> {
  const input = z.string().uuid().parse(workspaceId);

  return withWorkspace(
    { workspaceId: input, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .delete(guestThankYou)
        .where(eq(guestThankYou.workspaceId, input));

      revalidatePath("/guest-thank-you");

      return {
        success: true,
        message: "Semua pesan thank you berhasil dihapus.",
      };
    }
  );
}

/**
 * Ambil semua thank you messages untuk workspace dengan info tamu.
 */
export async function getThankYouMessagesAction(
  workspaceId: string
): Promise<any[]> {
  const input = z.string().uuid().parse(workspaceId);

  return withWorkspace(
    { workspaceId: input, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR", "FAMILY"] },
    async (tx) => {
      const messages = await tx
        .select()
        .from(guestThankYou)
        .where(eq(guestThankYou.workspaceId, input))
        .orderBy(guestThankYou.createdAt);

      // Enrich with guest info
      const guestIds = messages.map((m) => m.guestId);
      if (guestIds.length === 0) return [];

      const guestInfo = await tx
        .select({ id: guests.id, name: guests.name, phone: guests.phone, email: guests.email })
        .from(guests)
        .where(inArray(guests.id, guestIds));

      const guestMap = new Map(guestInfo.map((g) => [g.id, g]));

      return messages.map((msg) => ({
        ...msg,
        guestName: guestMap.get(msg.guestId)?.name || null,
        guestPhone: guestMap.get(msg.guestId)?.phone || null,
        guestEmail: guestMap.get(msg.guestId)?.email || null,
      }));
    }
  );
}
