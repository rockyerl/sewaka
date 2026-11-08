"use server";

import { revalidatePath } from "next/cache";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "../hooks/document-queries";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "../actions/document-schema";

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
