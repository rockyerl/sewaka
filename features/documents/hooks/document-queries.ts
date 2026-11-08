import { eq, and, ilike, desc } from "drizzle-orm";
import { documents } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import type { CreateDocumentInput, UpdateDocumentInput } from "@/features/documents/actions/document-schema";

export async function listWorkspaceDocuments(workspaceId: string, category?: string) {
  return withWorkspace(
    { workspaceId },
    async (tx) => {
      if (category) {
        return tx
          .select()
          .from(documents)
          .where(and(
            eq(documents.workspaceId, workspaceId),
            ilike(documents.category, category)
          ))
          .orderBy(desc(documents.createdAt));
      }
      return tx
        .select()
        .from(documents)
        .where(eq(documents.workspaceId, workspaceId))
        .orderBy(desc(documents.createdAt));
    }
  );
}

export async function getDocument(documentId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    const [found] = await tx
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.workspaceId, workspaceId),
        ),
      );
    return found;
  });
}

export async function createDocument(input: CreateDocumentInput) {
  return withWorkspace(async (tx, workspaceId) => {
    const [created] = await tx
      .insert(documents)
      .values({
        workspaceId,
        name: input.name,
        category: input.category,
        filePath: input.filePath,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
      })
      .returning();
    return created;
  });
}

export async function updateDocument(documentId: string, input: UpdateDocumentInput) {
  return withWorkspace(async (tx, workspaceId) => {
    const [updated] = await tx
      .update(documents)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.category !== undefined && { category: input.category }),
      })
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.workspaceId, workspaceId),
        ),
      )
      .returning();
    return updated;
  });
}

export async function deleteDocument(documentId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .delete(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.workspaceId, workspaceId),
        ),
      );
  });
}

export async function getDocumentCategories() {
  return withWorkspace(async (tx, workspaceId) => {
    const rows = await tx
      .select({ category: documents.category })
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId))
      .groupBy(documents.category);
    
    return rows.map((row) => row.category);
  });
}
