"use server";

import { eq } from "drizzle-orm";
import { documents } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { withWorkspace } from "@/lib/db/with-workspace";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/lib/utils/storage";
import { checkStorageLimit, SubscriptionLimitError } from "@/lib/utils/subscription-check";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Upload document file (DOC-01)
 */
export async function uploadDocumentAction(
  prevState: { success?: boolean; error?: string; fileUrl?: string } | FormData | undefined,
  formDataMaybe?: FormData,
): Promise<{ success?: boolean; error?: string; fileUrl?: string }> {
  const formData =
    formDataMaybe instanceof FormData
      ? formDataMaybe
      : prevState instanceof FormData
        ? prevState
        : null;

  if (!formData) {
    return { error: "Data form tidak ditemukan." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const workspaceId = formData.get("workspaceId") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const file = formData.get("file") as File;

  if (!workspaceId || !name || !category || !file) {
    return { error: "Semua field diperlukan." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran file maksimal 50MB." };
  }

  let uploadedFileUrl: string | undefined;
  try {
    await withWorkspace(
      { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
      async () => undefined,
    );
    // Check subscription storage limit
    await checkStorageLimit(workspaceId, file.size);

    // Upload to Vercel Blob storage
    const uploadResult = await uploadFile(file, {
      pathname: `documents/${workspaceId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`,
    });
    uploadedFileUrl = uploadResult.url;

    // Save to database
    await withWorkspace(
      { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
      (tx) => tx.insert(documents).values({
        workspaceId,
        name,
        category,
        filePath: uploadResult.url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: session.user.id,
      }),
    );

    revalidatePath("/documents");
    return { success: true, fileUrl: uploadResult.url };
  } catch (error: unknown) {
    if (uploadedFileUrl) await deleteFile(uploadedFileUrl).catch(() => undefined);
    if (error instanceof SubscriptionLimitError) {
      return { error: error.message };
    }
    return {
      error: error instanceof Error ? error.message : "Gagal mengupload file.",
    };
  }
}

/**
 * Delete document (DOC-02)
 */
export async function deleteDocumentAction(workspaceId: string, documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [doc] = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [row] = await tx.select().from(documents).where(
        eq(documents.id, documentId),
      ).limit(1);
      if (row?.workspaceId !== workspaceId) return [undefined] as const;
      if (row) await tx.delete(documents).where(eq(documents.id, documentId));
      return [row] as const;
    },
  );

  if (!doc) {
    throw new Error("Document not found");
  }

  // Delete file from cloud storage
  if (doc.filePath) {
    await deleteFile(doc.filePath);
  }

  revalidatePath("/documents");
}
