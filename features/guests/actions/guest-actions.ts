"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { guests, notifications, weddingWorkspaces, workspaceMembers } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { checkGuestLimit } from "@/lib/utils/subscription-check";

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
  await checkGuestLimit(input.workspaceId);

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
  const input = z.object({
    slug: z.string().trim().min(1).max(200),
    name: z.string().trim().min(1).max(200),
    rsvpStatus: z.enum(["ACCEPTED", "DECLINED", "PENDING"]),
    plusOnes: z.coerce.number().int().min(0).max(20),
    wishes: z.string().trim().max(2000),
    phone: z.string().trim().max(40),
  }).parse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    rsvpStatus: formData.get("rsvpStatus") || "ACCEPTED",
    plusOnes: formData.get("plusOnes") || "0",
    wishes: formData.get("wishes") || "",
    phone: formData.get("phone") || "",
  });
  const { slug, name, rsvpStatus, plusOnes, wishes, phone } = input;

  const db = getDb();
  const [workspace] = await db
    .select({ id: weddingWorkspaces.id })
    .from(weddingWorkspaces)
    .where(eq(weddingWorkspaces.invitationSlug, slug))
    .limit(1);

  if (!workspace) {
    throw new Error("Undangan pernikahan tidak ditemukan.");
  }

  const invitationCode = `SWK-${randomBytes(8).toString("hex").toUpperCase()}`;

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
    const statusText = rsvpStatus === "ACCEPTED"
      ? "HADIR"
      : rsvpStatus === "DECLINED"
        ? "TIDAK HADIR"
        : "BELUM KONFIRMASI";
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
