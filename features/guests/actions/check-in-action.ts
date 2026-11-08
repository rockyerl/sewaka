"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

/**
 * Public check-in: Find guest by invitation code and mark as checked in.
 * Returns guest info and workspace info for the confirmation page.
 */
export async function publicCheckInAction(invitationCode: string) {
  if (!invitationCode) {
    return { error: "Kode undangan tidak valid." };
  }

  const db = getDb();

  // Find guest by invitation code
  const [guest] = await db
    .select({
      id: guests.id,
      workspaceId: guests.workspaceId,
      name: guests.name,
      checkedIn: guests.checkedIn,
      checkedInAt: guests.checkedInAt,
      invitationCode: guests.invitationCode,
    })
    .from(guests)
    .where(eq(guests.invitationCode, invitationCode))
    .limit(1);

  if (!guest) {
    return { error: "Kode undangan tidak ditemukan. Pastikan kode benar." };
  }

  // Already checked in
  if (guest.checkedIn) {
    return {
      alreadyCheckedIn: true,
      guest: {
        id: guest.id,
        name: guest.name,
        checkedInAt: guest.checkedInAt,
      },
      workspaceId: guest.workspaceId,
    };
  }

  // Mark as checked in
  await db
    .update(guests)
    .set({
      checkedIn: true,
      checkedInAt: new Date(),
    })
    .where(eq(guests.id, guest.id));

  revalidatePath("/guests");
  revalidatePath("/check-in");

  return {
    success: true,
    guest: {
      id: guest.id,
      name: guest.name,
      checkedInAt: new Date(),
    },
    workspaceId: guest.workspaceId,
  };
}
