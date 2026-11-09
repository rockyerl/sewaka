"use server";

import { and, eq, inArray } from "drizzle-orm";
import { guests, weddingWorkspaces } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { withWorkspace } from "@/lib/db/with-workspace";

interface BulkInviteResult {
  success: boolean;
  total: number;
  links: { name: string; phone: string; link: string }[];
  error?: string;
}

/**
 * Generate bulk WhatsApp invite links for selected guests.
 * Rate limited to 50 guests per batch for security.
 */
export async function bulkWaInviteAction(guestIds: string[]): Promise<BulkInviteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, total: 0, links: [], error: "Unauthorized" };
  }

  // Rate limit
  if (guestIds.length > 50) {
    return { success: false, total: 0, links: [], error: "Maksimal 50 tamu per batch." };
  }

  if (guestIds.length === 0) {
    return { success: false, total: 0, links: [], error: "Pilih minimal 1 tamu." };
  }

  return withWorkspace(async (tx, workspaceId) => {
    const guestRows = await tx
      .select({ id: guests.id, name: guests.name, phone: guests.phone })
      .from(guests)
      .where(and(inArray(guests.id, guestIds), eq(guests.workspaceId, workspaceId)));

    if (guestRows.length === 0) {
      return { success: false, total: 0, links: [], error: "Tidak ada tamu ditemukan." };
    }

    const [workspace] = await tx
      .select({ invitationSlug: weddingWorkspaces.invitationSlug, coupleOne: weddingWorkspaces.coupleOne, coupleTwo: weddingWorkspaces.coupleTwo, name: weddingWorkspaces.name })
      .from(weddingWorkspaces)
      .where(eq(weddingWorkspaces.id, workspaceId))
      .limit(1);

    if (!workspace?.invitationSlug) {
      return { success: false, total: 0, links: [], error: "Slug undangan belum tersedia." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const coupleName = workspace.coupleOne && workspace.coupleTwo
      ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
      : workspace.name;
    const links = guestRows.map((guest) => {
      const inviteLink = `${baseUrl}/invitation/${workspace.invitationSlug}?to=${encodeURIComponent(guest.name)}`;
      const message = `Yang Terhormat Bpk/Ibu ${guest.name},\n\nKami mengundang Anda untuk hadir di pernikahan ${coupleName}.\n\nBuka undangan digital kami di sini:\n${inviteLink}\n\nTerima kasih atas doa dan restu Anda.`;
      return {
        name: guest.name,
        phone: guest.phone || "-",
        link: `https://wa.me/${guest.phone ? guest.phone.replace(/[^0-9]/g, "") : ""}?text=${encodeURIComponent(message)}`,
      };
    });

    return { success: true, total: links.length, links };
  });
}
