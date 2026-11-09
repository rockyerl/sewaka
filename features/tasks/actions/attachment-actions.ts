"use server";

import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { and, eq, asc } from "drizzle-orm";

import { taskAttachments, tasks } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { deleteFile } from "@/lib/utils/storage";
import { checkStorageLimit } from "@/lib/utils/subscription-check";

export async function uploadTaskAttachmentAction(
  data: { taskId: string; workspaceId: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string },
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  await checkStorageLimit(data.workspaceId, data.fileSize);
  await withWorkspace(
    { workspaceId: data.workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [task] = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(eq(tasks.id, data.taskId), eq(tasks.workspaceId, data.workspaceId)))
        .limit(1);
      if (!task) throw new Error("Tugas tidak ditemukan.");

      await tx.insert(taskAttachments).values({
        taskId: data.taskId,
        workspaceId: data.workspaceId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        uploadedBy: session.user.id,
      });
    },
  );

  revalidatePath("/tasks");
}

export async function getTaskAttachmentsAction(taskId: string, workspaceId: string) {
  return withWorkspace({ workspaceId }, async (tx) =>
    tx
      .select()
      .from(taskAttachments)
      .where(and(eq(taskAttachments.taskId, taskId), eq(taskAttachments.workspaceId, workspaceId)))
      .orderBy(asc(taskAttachments.createdAt)),
  );
}

export async function deleteTaskAttachmentAction(attachmentId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const [attachment] = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [row] = await tx
        .select()
        .from(taskAttachments)
        .where(and(eq(taskAttachments.id, attachmentId), eq(taskAttachments.workspaceId, workspaceId)))
        .limit(1);
      if (row) {
        await tx.delete(taskAttachments).where(
          and(eq(taskAttachments.id, attachmentId), eq(taskAttachments.workspaceId, workspaceId)),
        );
      }
      return [row] as const;
    },
  );

  // Delete from cloud storage
  if (attachment && attachment.fileUrl) {
    await deleteFile(attachment.fileUrl);
  }

  revalidatePath("/tasks");
}
