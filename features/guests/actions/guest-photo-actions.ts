"use server";

import { eq, and, desc, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guestPhotos } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { put } from "@vercel/blob";
import { logger } from "@/lib/utils/logger";
import { rateLimit } from "@/lib/utils/rate-limit";

const viewerRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export interface GuestPhoto {
  id: string;
  guestName: string;
  guestPhone: string | null;
  photoUrl: string;
  caption: string | null;
  status: string;
  createdAt: Date;
}

/**
 * Upload foto tamu dari undangan public (tanpa auth).
 */
export async function uploadGuestPhotoAction(input: {
  workspaceId: string;
  guestName: string;
  guestPhone?: string;
  caption?: string;
  file: File;
}): Promise<{ success: boolean; photo?: GuestPhoto; error?: string }> {
  // Rate limiting: max 5 photos per minute per workspace
  const limited = await rateLimit({
    key: `guest-photo-upload-${input.workspaceId}`,
    limit: 5,
    windowMs: 60000,
  });
  if (limited.isLimited) {
    return {
      success: false,
      error: "Terlalu banyak upload. Coba lagi nanti.",
    };
  }

  // Validate file
  if (!input.file.type.startsWith("image/")) {
    return {
      success: false,
      error: "File harus berupa gambar",
    };
  }
  if (input.file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Ukuran file maksimal 10MB",
    };
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(`guest-photo/${input.workspaceId}/${Date.now()}-${input.file.name}`, input.file, {
      access: "public",
    });

    const db = getDb();

    // Insert to database with PENDING status
    const [photo] = await db
      .insert(guestPhotos)
      .values({
        workspaceId: input.workspaceId,
        guestName: input.guestName,
        guestPhone: input.guestPhone || null,
        photoUrl: blob.url,
        caption: input.caption || null,
        status: "PENDING",
      })
      .returning();

    logger.info("Guest photo uploaded", {
      workspaceId: input.workspaceId,
      guestName: input.guestName,
      photoId: photo?.id,
    });

    return {
      success: true,
      photo: photo as GuestPhoto,
    };
  } catch (error) {
    logger.error("Failed to upload guest photo", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal upload foto",
    };
  }
}

/**
 * Get approved guest photos untuk ditampilkan di undangan public.
 */
export async function getApprovedGuestPhotosAction(workspaceId: string): Promise<GuestPhoto[]> {
  const db = getDb();

  const photos = await db
    .select()
    .from(guestPhotos)
    .where(
      and(
        eq(guestPhotos.workspaceId, workspaceId),
        eq(guestPhotos.status, "APPROVED")
      )
    )
    .orderBy(desc(guestPhotos.createdAt))
    .limit(50);

  return photos as GuestPhoto[];
}

/**
 * Get pending guest photos untuk moderation admin.
 */
export async function getPendingGuestPhotosAction(workspaceId: string): Promise<GuestPhoto[]> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async () => {
      const db = getDb();

      const photos = await db
        .select()
        .from(guestPhotos)
        .where(
          and(
            eq(guestPhotos.workspaceId, workspaceId),
            eq(guestPhotos.status, "PENDING")
          )
        )
        .orderBy(asc(guestPhotos.createdAt));

      return photos as GuestPhoto[];
    }
  );
}

/**
 * Approve guest photo.
 */
export async function approveGuestPhotoAction(input: {
  workspaceId: string;
  photoId: string;
}): Promise<{ success: boolean; error?: string }> {
  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: viewerRoles },
    async () => {
      const db = getDb();

      await db
        .update(guestPhotos)
        .set({ status: "APPROVED" })
        .where(
          and(
            eq(guestPhotos.id, input.photoId),
            eq(guestPhotos.workspaceId, input.workspaceId)
          )
        );

      logger.info("Guest photo approved", {
        workspaceId: input.workspaceId,
        photoId: input.photoId,
      });

      return { success: true };
    }
  );
}

/**
 * Reject guest photo.
 */
export async function rejectGuestPhotoAction(input: {
  workspaceId: string;
  photoId: string;
}): Promise<{ success: boolean; error?: string }> {
  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: viewerRoles },
    async () => {
      const db = getDb();

      await db
        .update(guestPhotos)
        .set({ status: "REJECTED" })
        .where(
          and(
            eq(guestPhotos.id, input.photoId),
            eq(guestPhotos.workspaceId, input.workspaceId)
          )
        );

      logger.info("Guest photo rejected", {
        workspaceId: input.workspaceId,
        photoId: input.photoId,
      });

      return { success: true };
    }
  );
}
