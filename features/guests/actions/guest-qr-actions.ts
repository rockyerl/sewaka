"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { requireFeature, SubscriptionLimitError } from "@/lib/subscription-check";

/**
 * Check in guest by invitation code (GST-08)
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

  const invitationCode = formData.get("invitationCode") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!invitationCode || !workspaceId) {
    return { error: "Kode undangan diperlukan." };
  }

  try {
    const db = getDb();

    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.invitationCode, invitationCode))
      .limit(1);

    if (!guest) {
      return { error: "Kode undangan tidak ditemukan." };
    }

    if (guest.checkedIn) {
      return { error: "Tamu sudah check-in." };
    }

    await db
      .update(guests)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
        rsvpStatus: "ACCEPTED",
      })
      .where(eq(guests.id, guest.id));

    revalidatePath("/guests");
    return { success: true };
  } catch (error: any) {
    return {
      error: error?.message || "Gagal check-in tamu.",
    };
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
  }

  const db = getDb();

  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, guestId))
    .limit(1);

  if (!guest) {
    throw new Error("Guest not found");
  }

  // Use invitation code as QR data, or generate one
  return guest.invitationCode ?? `SEWAKA-${guest.id.slice(0, 8).toUpperCase()}`;
}
