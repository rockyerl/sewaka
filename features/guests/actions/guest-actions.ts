"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { guests, notifications, weddingWorkspaces, workspaceMembers } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { checkGuestLimit, SubscriptionLimitError } from "@/lib/utils/subscription-check";

import { createGuestSchema, deleteGuestSchema, updateGuestRsvpSchema } from "../actions/guest-schema";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function createGuestAction(formData: FormData) {
  const input = createGuestSchema.parse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    email: String(formData.get("email") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    category: String(formData.get("category") ?? "") || undefined,
    side: String(formData.get("side") ?? "") || undefined,
    isVip: formData.get("isVip") === "on" || formData.get("isVip") === "true",
    plusOnes: formData.get("plusOnes") || undefined,
  });

  // Check subscription guest limit
  try {
    await checkGuestLimit(input.workspaceId);
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
  }

  const inviteCode = `SWK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx.insert(guests).values({
        workspaceId: input.workspaceId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        category: input.category || null,
        side: input.side || null,
        isVip: input.isVip ?? false,
        plusOnes: input.plusOnes ?? 0,
        invitationCode: inviteCode,
      });
    },
  );

  revalidatePath("/guests");
}

export async function updateGuestRsvpAction(formData: FormData) {
  const input = updateGuestRsvpSchema.parse({
    workspaceId: formData.get("workspaceId"),
    guestId: formData.get("guestId"),
    rsvpStatus: formData.get("rsvpStatus"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .update(guests)
        .set({ rsvpStatus: input.rsvpStatus })
        .where(
          and(
            eq(guests.id, input.guestId),
            eq(guests.workspaceId, input.workspaceId),
          ),
        );
    },
  );

  revalidatePath("/guests");
}

export async function toggleCheckInAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const guestId = String(formData.get("guestId") ?? "");
  const currentCheckedIn = formData.get("checkedIn") === "true";

  if (!workspaceId || !guestId) {
    throw new Error("Data tidak lengkap.");
  }

  await withWorkspace(
    { workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .update(guests)
        .set({
          checkedIn: !currentCheckedIn,
          checkedInAt: !currentCheckedIn ? new Date() : null,
        })
        .where(
          and(
            eq(guests.id, guestId),
            eq(guests.workspaceId, workspaceId),
          ),
        );
    },
  );

  revalidatePath("/guests");
}

export async function deleteGuestAction(formData: FormData) {
  const input = deleteGuestSchema.parse({
    workspaceId: formData.get("workspaceId"),
    guestId: formData.get("guestId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .delete(guests)
        .where(
          and(
            eq(guests.id, input.guestId),
            eq(guests.workspaceId, input.workspaceId),
          ),
        );
    },
  );

  revalidatePath("/guests");
}

/**
 * Public RSVP submission from /invitation/[slug]
 */
export async function submitPublicRsvpAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const rsvpStatus = String(formData.get("rsvpStatus") ?? "ACCEPTED") as "ACCEPTED" | "DECLINED" | "PENDING";
  const plusOnes = Math.max(0, parseInt(String(formData.get("plusOnes") ?? "0"), 10) || 0);
  const wishes = String(formData.get("wishes") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!slug || !name) {
    throw new Error("Nama dan slug undangan wajib diisi.");
  }

  const db = getDb();
  const [workspace] = await db
    .select({ id: weddingWorkspaces.id })
    .from(weddingWorkspaces)
    .where(eq(weddingWorkspaces.invitationSlug, slug))
    .limit(1);

  if (!workspace) {
    throw new Error("Undangan pernikahan tidak ditemukan.");
  }

  const invitationCode = `SWK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const [insertedGuest] = await db.insert(guests).values({
    workspaceId: workspace.id,
    name,
    rsvpStatus,
    plusOnes,
    wishes: wishes || null,
    phone: phone || null,
    invitationCode,
  }).returning({ id: guests.id });

  // Notify workspace members about new RSVP
  const [member] = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspace.id))
    .limit(1);

  if (member?.userId) {
    const statusText = rsvpStatus === "ACCEPTED" ? "HADIR" : "TIDAK HADIR";
    const plusText = plusOnes > 0 ? ` (+${plusOnes} pendamping)` : "";
    await db.insert(notifications).values({
      workspaceId: workspace.id,
      userId: member.userId,
      type: "INVITATION",
      title: `RSVP Baru: ${name}`,
      message: `${name} telah mengonfirmasi ${statusText}${plusText}.${wishes ? ` Ucapan: "${wishes}"` : ""}`,
      read: "UNREAD",
      entityType: "guest",
      entityId: insertedGuest?.id ?? null,
    });
  }

  revalidatePath(`/invitation/${slug}`);
  revalidatePath("/guests");
  revalidatePath("/");
  return { success: true, invitationCode };
}
