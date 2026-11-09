"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  generateChecklist,
  deleteChecklist,
  getAllChecklist,
  getChecklistProgress,
} from "../hooks/document-queries";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "../actions/document-schema";
import type { NikahType } from "@/lib/constants/nikah-berkas-templates";

export async function createDocumentAction(formData: FormData) {
  const input = createDocumentSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    fileSize: formData.get("fileSize"),
    mimeType: formData.get("mimeType"),
    filePath: formData.get("filePath"),
  });

  await createDocument(input);
  revalidatePath("/documents");
}

export async function updateDocumentAction(formData: FormData) {
  const documentId = formData.get("documentId") as string;
  const input = updateDocumentSchema.parse({
    name: formData.get("name") || undefined,
    category: formData.get("category") || undefined,
  });

  await updateDocument(documentId, input);
  revalidatePath("/documents");
}

export async function deleteDocumentAction(formData: FormData) {
  const documentId = formData.get("documentId") as string;
  await deleteDocument(documentId);
  revalidatePath("/documents");
}

// --- Checklist actions (merged from nikah_berkas) ---

export async function generateChecklistAction(
  workspaceId: string,
  nikahType: NikahType
) {
  const result = await generateChecklist(workspaceId, nikahType);
  revalidatePath("/documents");
  return result;
}

export async function deleteChecklistAction(
  workspaceId: string,
  nikahType: NikahType
) {
  const result = await deleteChecklist(workspaceId, nikahType);
  revalidatePath("/documents");
  return result;
}

export async function updateDocumentStatusAction(
  documentId: string,
  workspaceId: string,
  data: {
    isCompleted?: boolean;
    fileUrl?: string;
    notes?: string;
    deadlineDate?: string;
  }
) {
  const schema = z.object({
    documentId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    isCompleted: z.boolean().optional(),
    fileUrl: z.string().optional(),
    notes: z.string().max(500).optional(),
    deadlineDate: z.string().optional(),
  });

  schema.parse({ documentId, workspaceId, ...data });

  const input: {
    isCompleted?: boolean;
    fileUrl?: string;
    notes?: string;
    deadlineDate?: string;
  } = {};
  if (data.isCompleted !== undefined) input.isCompleted = data.isCompleted;
  if (data.fileUrl !== undefined) input.fileUrl = data.fileUrl;
  if (data.notes !== undefined) input.notes = data.notes;
  if (data.deadlineDate !== undefined) input.deadlineDate = data.deadlineDate;

  await updateDocument(documentId, input);
  revalidatePath("/documents");

  return {
    success: true,
    message: "Status dokumen berhasil diupdate.",
  };
}

export async function getAllChecklistAction(workspaceId: string) {
  return getAllChecklist(workspaceId);
}

export async function getChecklistProgressAction(workspaceId: string) {
  return getChecklistProgress(workspaceId);
}
