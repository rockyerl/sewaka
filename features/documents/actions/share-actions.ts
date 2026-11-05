"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getDb } from "@/db";
import { documentShares, documents } from "@/db/schema";

export async function createDocumentShareAction(documentId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const shareCode = randomUUID().slice(0, 8);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

  await getDb().insert(documentShares).values({
    documentId,
    workspaceId,
    shareCode,
    expiresAt,
    createdBy: session.user.id,
  });

  revalidatePath("/documents");
  return shareCode;
}

export async function getDocumentByShareCodeAction(shareCode: string) {
  const [share] = await getDb()
    .select({
      documentId: documentShares.documentId,
      workspaceId: documentShares.workspaceId,
      expiresAt: documentShares.expiresAt,
      documentName: documents.name,
      filePath: documents.filePath,
      mimeType: documents.mimeType,
      fileSize: documents.fileSize,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documentShares.documentId, documents.id))
    .where(eq(documentShares.shareCode, shareCode));

  if (!share) return null;

  // Check expiration
  if (share.expiresAt && share.expiresAt < new Date()) {
    return null;
  }

  return share;
}

export async function deleteDocumentShareAction(shareId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  await getDb().delete(documentShares).where(eq(documentShares.id, shareId));
  revalidatePath("/documents");
}
