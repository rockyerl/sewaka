"use server";

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { imageGallery } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/lib/storage";
import { checkStorageLimit, SubscriptionLimitError } from "@/lib/subscription-check";

export async function uploadImageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) throw new Error("File tidak valid");

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Ukuran file maksimal 10MB.");
  }

  // Check subscription storage limit
  try {
    await checkStorageLimit(workspaceId, file.size);
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
  }

  // Upload to Vercel Blob storage
  const uploadResult = await uploadFile(file, {
    pathname: `gallery/${workspaceId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`,
    accessType: "public",
  });

  const db = await getDb();
  const [image] = await db
    .insert(imageGallery)
    .values({
      workspaceId,
      title: title || file.name,
      fileUrl: uploadResult.url,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: session.user.id,
    })
    .returning();

  revalidatePath("/gallery");
  return { success: true, image };
}

export async function deleteImageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const imageId = formData.get("imageId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!imageId || !workspaceId) throw new Error("Data tidak valid");

  const db = await getDb();
  const [image] = await db
    .select()
    .from(imageGallery)
    .where(
      and(
        eq(imageGallery.id, imageId),
        eq(imageGallery.workspaceId, workspaceId)
      )
    );

  // Delete from cloud storage
  if (image && image.fileUrl) {
    await deleteFile(image.fileUrl);
  }

  await db.delete(imageGallery).where(
    and(
      eq(imageGallery.id, imageId),
      eq(imageGallery.workspaceId, workspaceId)
    )
  );

  revalidatePath("/gallery");
  return { success: true };
}

export async function updateImageTitleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const imageId = formData.get("imageId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;

  if (!imageId || !workspaceId || !title) throw new Error("Data tidak valid");

  const db = await getDb();
  await db
    .update(imageGallery)
    .set({ title })
    .where(
      and(
        eq(imageGallery.id, imageId),
        eq(imageGallery.workspaceId, workspaceId)
      )
    );

  revalidatePath("/gallery");
  return { success: true };
}
