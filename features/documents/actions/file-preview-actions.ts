"use server";

import { and, eq } from "drizzle-orm";
import { documents } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

/**
 * Get file preview URL (DOC-07)
 * Returns the file URL for preview
 */
export async function getFilePreview(documentId: string, workspaceId: string) {
  const [document] = await withWorkspace({ workspaceId }, (tx) =>
    tx.select().from(documents).where(
      and(eq(documents.id, documentId), eq(documents.workspaceId, workspaceId)),
    ).limit(1),
  );

  if (!document) {
    throw new Error("Document not found");
  }

  // Determine if file can be previewed
  const previewableTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "application/pdf",
    "text/plain", "text/csv", "text/html", "text/xml",
    "application/json", "application/javascript", "text/javascript",
    "video/mp4", "video/webm",
    "audio/mp3", "audio/wav", "audio/ogg"
  ];

  const canPreview = document.mimeType ? previewableTypes.includes(document.mimeType) : false;

  return {
    id: document.id,
    fileName: document.name,
    fileUrl: document.filePath ?? '',
    fileType: document.mimeType ?? '',
    fileSize: document.fileSize ?? 0,
    canPreview,
    previewType: document.mimeType ? getPreviewType(document.mimeType) : "none",
  };
}

/**
 * Get preview type based on MIME type
 */
function getPreviewType(mimeType: string): "image" | "pdf" | "text" | "video" | "audio" | "none" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/") || mimeType === "application/json" || mimeType.includes("javascript")) return "text";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "none";
}
