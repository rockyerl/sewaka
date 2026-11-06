"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";

import { getDb } from "@/db";
import { taskAttachments } from "@/db/schema";
import { deleteFile } from "@/lib/storage";
import { checkStorageLimit, SubscriptionLimitError } from "@/lib/subscription-check";

export async function uploadTaskAttachmentAction(
  data: { taskId: string; workspaceId: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string },
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  // Check subscription storage limit
  try {
    await checkStorageLimit(data.workspaceId, data.fileSize);
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
  }

  await getDb().insert(taskAttachments).values({
    taskId: data.taskId,
    workspaceId: data.workspaceId,
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    uploadedBy: session.user.id,
  });

  revalidatePath("/tasks");
}

export async function getTaskAttachmentsAction(taskId: string) {
  const result = await getDb()
    .select()
    .from(taskAttachments)
    .where(eq(taskAttachments.taskId, taskId))
    .orderBy(asc(taskAttachments.createdAt));

  return result;
}

export async function deleteTaskAttachmentAction(attachmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const [attachment] = await getDb()
    .select()
    .from(taskAttachments)
    .where(eq(taskAttachments.id, attachmentId))
    .limit(1);

  // Delete from cloud storage
  if (attachment && attachment.fileUrl) {
    await deleteFile(attachment.fileUrl);
  }

  await getDb().delete(taskAttachments).where(eq(taskAttachments.id, attachmentId));
  revalidatePath("/tasks");
}
