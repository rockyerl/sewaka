"use server";

import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Public check-in: Find guest by invitation code and mark as checked in.
 * Returns guest info and workspace info for the confirmation page.
 * Idempotent: returns success if already checked in.
 */
type PublicCheckInResult =
  | { error: string }
  | { alreadyCheckedIn: true; guest: { id: string; name: string; checkedInAt: Date | null }; workspaceId: string }
  | { success: true; guest: { id: string; name: string; checkedInAt: Date | null }; workspaceId: string };

export async function publicCheckInAction(invitationCode: string): Promise<PublicCheckInResult> {
  if (!invitationCode) {
    return { error: "Kode undangan tidak valid." };
  }

  const result = await getDb().execute(sql`select public.public_guest_check_in(${invitationCode}) as result`);
  const payload = (result.rows[0] as { result?: unknown } | undefined)?.result as PublicCheckInResult | undefined;
  if (!payload || ("error" in payload && payload.error)) return { error: payload && "error" in payload ? payload.error : "Kode undangan tidak ditemukan. Pastikan kode benar." };
  if (!("guest" in payload) || !payload.guest || !payload.workspaceId) return { error: "Kode undangan tidak ditemukan. Pastikan kode benar." };
  const normalized = { ...payload, guest: { ...payload.guest, checkedInAt: payload.guest.checkedInAt ? new Date(payload.guest.checkedInAt) : null } };

  revalidatePath("/guests");
  revalidatePath("/check-in");

  return normalized;
}
