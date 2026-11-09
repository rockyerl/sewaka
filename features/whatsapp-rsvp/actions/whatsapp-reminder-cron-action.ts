"use server";

import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { whatsappMessages, guests, weddingWorkspaces } from "@/lib/db/schema";
import { logger } from "@/lib/utils/logger";

/**
 * Cron job action: Kirim reminder WhatsApp otomatis ke tamu yang belum RSVP.
 * Berjalan sekali sehari via Vercel Cron.
 * - 7 hari sebelum wedding: Kirim reminder pertama
 * - 1 hari sebelum wedding: Kirim reminder terakhir
 */
export async function sendWeddingRemindersAction(): Promise<{
  success: boolean;
  reminder7d: number;
  reminder1d: number;
  error?: string;
}> {
  const now = new Date();

  // Cron harian dapat bergeser hingga sekitar satu jam; gunakan jendela 26 jam
  // agar perubahan waktu eksekusi tidak membuat target terlewat.
  const date7dStart = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const date7dEnd = new Date(now.getTime() + (7 * 24 + 2) * 60 * 60 * 1000);

  // Reminder H-1: dari sekarang sampai 26 jam ke depan.
  const date1dStart = now;
  const date1dEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  let reminder7d = 0;
  let reminder1d = 0;

  try {
    const db = getDb();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Ambil semua workspace yang memiliki wedding_date dalam 7-6 hari dari sekarang
    const workspaces7d = await db
      .select({
        id: weddingWorkspaces.id,
        weddingDate: weddingWorkspaces.weddingDate,
        coupleOne: weddingWorkspaces.coupleOne,
        coupleTwo: weddingWorkspaces.coupleTwo,
        name: weddingWorkspaces.name,
        invitationSlug: weddingWorkspaces.invitationSlug,
      })
      .from(weddingWorkspaces)
      .where(
        and(
          gte(weddingWorkspaces.weddingDate, date7dStart),
          lte(weddingWorkspaces.weddingDate, date7dEnd)
        )
      );

    // Ambil semua workspace yang memiliki wedding_date dalam 1-0 hari dari sekarang
    const workspaces1d = await db
      .select({
        id: weddingWorkspaces.id,
        weddingDate: weddingWorkspaces.weddingDate,
        coupleOne: weddingWorkspaces.coupleOne,
        coupleTwo: weddingWorkspaces.coupleTwo,
        name: weddingWorkspaces.name,
        invitationSlug: weddingWorkspaces.invitationSlug,
      })
      .from(weddingWorkspaces)
      .where(
        and(
          gte(weddingWorkspaces.weddingDate, date1dStart),
          lte(weddingWorkspaces.weddingDate, date1dEnd)
        )
      );

    // Proses reminder 7 hari
    for (const workspace of workspaces7d) {
      if (!workspace.invitationSlug) continue;

      const coupleName =
        workspace.coupleOne && workspace.coupleTwo
          ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
          : workspace.name;

      // Ambil tamu yang belum RSVP
      const pendingGuests = await db
        .select({
          id: guests.id,
          name: guests.name,
          phone: guests.phone,
        })
        .from(guests)
        .where(
          and(
            eq(guests.workspaceId, workspace.id),
            eq(guests.rsvpStatus, "PENDING")
          )
        );

      // Ambil guest IDs yang sudah pernah dapat reminder 7D
      const remindedMessages = await db
        .select({ guestId: whatsappMessages.guestId })
        .from(whatsappMessages)
        .where(
          and(
            eq(whatsappMessages.workspaceId, workspace.id),
            eq(whatsappMessages.messageType, "REMINDER_7D")
          )
        );
      const remindedGuestIds = remindedMessages.map((m) => m.guestId);

      for (const guest of pendingGuests) {
        if (!guest.phone || remindedGuestIds.includes(guest.id)) continue;

        const guestInviteLink = `${baseUrl}/invitation/${workspace.invitationSlug}?to=${encodeURIComponent(guest.name)}`;
        const message = `Halo ${guest.name}! Ini pengingat bahwa pernikahan ${coupleName} akan segera hadir dalam 7 hari lagi. Mohon konfirmasi kehadiran Anda di ${guestInviteLink}. Terima kasih!`;

        const cleanPhone = guest.phone.replace(/[^0-9]/g, "");

        await db.insert(whatsappMessages).values({
          workspaceId: workspace.id,
          guestId: guest.id,
          phoneNumber: cleanPhone,
          messageType: "REMINDER_7D",
          messageTemplate: message,
          status: "PENDING",
        });

        reminder7d++;
      }
    }

    // Proses reminder 1 hari
    for (const workspace of workspaces1d) {
      if (!workspace.invitationSlug) continue;

      const coupleName =
        workspace.coupleOne && workspace.coupleTwo
          ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
          : workspace.name;

      // Ambil tamu yang belum RSVP
      const pendingGuests = await db
        .select({
          id: guests.id,
          name: guests.name,
          phone: guests.phone,
        })
        .from(guests)
        .where(
          and(
            eq(guests.workspaceId, workspace.id),
            eq(guests.rsvpStatus, "PENDING")
          )
        );

      const remindedMessages = await db
        .select({ guestId: whatsappMessages.guestId })
        .from(whatsappMessages)
        .where(
          and(
            eq(whatsappMessages.workspaceId, workspace.id),
            eq(whatsappMessages.messageType, "REMINDER_1D")
          )
        );
      const remindedGuestIds = new Set(remindedMessages.map((m) => m.guestId));

      for (const guest of pendingGuests) {
        if (!guest.phone || remindedGuestIds.has(guest.id)) continue;

        const guestInviteLink = `${baseUrl}/invitation/${workspace.invitationSlug}?to=${encodeURIComponent(guest.name)}`;
        const message = `Halo ${guest.name}! Besok adalah hari pernikahan ${coupleName}. Kami sangat menantikan kehadiran Anda. Mohon konfirmasi kehadiran Anda di ${guestInviteLink}. Terima kasih!`;

        const cleanPhone = guest.phone.replace(/[^0-9]/g, "");

        await db.insert(whatsappMessages).values({
          workspaceId: workspace.id,
          guestId: guest.id,
          phoneNumber: cleanPhone,
          messageType: "REMINDER_1D",
          messageTemplate: message,
          status: "PENDING",
        });

        reminder1d++;
      }
    }

    logger.info("WhatsApp reminder cron completed", {
      reminder7d,
      reminder1d,
    });

    return {
      success: true,
      reminder7d,
      reminder1d,
    };
  } catch (error) {
    logger.error("WhatsApp reminder cron failed", error);
    return {
      success: false,
      reminder7d: 0,
      reminder1d: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
