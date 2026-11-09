"use server";

import { and, eq } from "drizzle-orm";
import { guests, checkInLogs } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { withWorkspace } from "@/lib/db/with-workspace";
import { revalidatePath } from "next/cache";
import { requireFeature, SubscriptionLimitError } from "@/lib/utils/subscription-check";

/**
 * Check in guest by invitation code (GST-08)
 * Idempotent: returns success if already checked in.
 */
export async function checkInGuestAction(
  prevState: { success?: boolean; error?: string } | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const invitationCode = String(formData.get("invitationCode") ?? "").trim();
  const workspaceId = String(formData.get("workspaceId") ?? "");

  if (!invitationCode || !workspaceId) {
    return { error: "Kode undangan diperlukan." };
  }

  const session = await auth();
  if (!session?.user?.id) return { error: "Silakan masuk terlebih dahulu." };

  try {
    const result = await withWorkspace(
      { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
      async (tx) => {
        const [guest] = await tx.select().from(guests).where(and(
          eq(guests.workspaceId, workspaceId),
          eq(guests.invitationCode, invitationCode),
        )).limit(1);
        if (!guest) return { error: "Kode undangan tidak ditemukan." };
        if (guest.checkedIn) return { success: true };

        const checkedInAt = new Date();
        const [updated] = await tx.update(guests).set({
          checkedIn: true,
          checkedInAt,
          checkedInBy: session.user.name || session.user.id,
          checkedInDevice: "admin-panel",
          rsvpStatus: "ACCEPTED",
        }).where(and(
          eq(guests.id, guest.id),
          eq(guests.workspaceId, workspaceId),
          eq(guests.checkedIn, false),
        )).returning({ id: guests.id });

        if (!updated) return { success: true };
        await tx.insert(checkInLogs).values({
          guestId: guest.id,
          workspaceId,
          action: "CHECK_IN",
          performedBy: session.user.name || session.user.id,
          deviceInfo: "admin-panel",
          invitationCode,
          checkedInAt,
          syncStatus: "SYNCED",
          metadata: { guestName: guest.name },
        });
        return { success: true };
      },
    );
    if (result.success) revalidatePath("/guests");
    return result;
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Gagal check-in tamu." };
  }
}

/**
 * Generate QR code data for a guest (GST-09)
 * Returns the invitation code that can be encoded as QR
 */
export async function generateGuestQRCode(workspaceId: string, guestId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // QR code generation is a premium feature
  try {
    await requireFeature(workspaceId, "qr_checkin");
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
    throw err;
  }

  const [guest] = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    (db) => db.select().from(guests).where(
      and(eq(guests.id, guestId), eq(guests.workspaceId, workspaceId)),
    ).limit(1),
  );

  if (!guest) {
    throw new Error("Guest not found");
  }

  // Use invitation code as QR data, or generate one
  return guest.invitationCode ?? `SEWAKA-${guest.id.slice(0, 8).toUpperCase()}`;
}
