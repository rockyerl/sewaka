import { eq, and, ilike, desc, asc, isNotNull } from "drizzle-orm";
import { documents } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import type { CreateDocumentInput, UpdateDocumentInput, GenerateChecklistInput } from "@/features/documents/actions/document-schema";
import { NIKAH_BERKAS_TEMPLATES, type NikahType } from "@/lib/constants/nikah-berkas-templates";

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
        filePath: input.filePath ?? null,
        fileSize: input.fileSize ?? null,
        mimeType: input.mimeType ?? null,
        documentDescription: input.documentDescription ?? null,
        isRequired: input.isRequired ?? false,
        isCompleted: input.isCompleted ?? false,
        deadlineDate: input.deadlineDate ? new Date(input.deadlineDate).toISOString().split('T')[0] : null,
        notes: input.notes ?? null,
        nikahType: input.nikahType ?? null,
      })
      .returning();
    return created;
  });
}

export async function updateDocument(documentId: string, input: UpdateDocumentInput) {
  return withWorkspace(async (tx, workspaceId) => {
    const updateData: Record<string, any> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.isCompleted !== undefined) {
      updateData.isCompleted = input.isCompleted;
      updateData.completedAt = input.isCompleted ? new Date() : null;
    }
    if (input.fileUrl !== undefined) updateData.filePath = input.fileUrl;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.deadlineDate !== undefined) {
      updateData.deadlineDate = input.deadlineDate ? new Date(input.deadlineDate).toISOString().split('T')[0] : null;
    }

    const [updated] = await tx
      .update(documents)
      .set(updateData)
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

// --- Checklist functions (merged from nikah_berkas) ---

export async function generateChecklist(workspaceId: string, nikahType: NikahType) {
  return withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      // Idempotent check
      const existing = await tx
        .select()
        .from(documents)
        .where(and(
          eq(documents.workspaceId, workspaceId),
          eq(documents.nikahType, nikahType)
        ));

      if (existing.length > 0) {
        return {
          success: false,
          documentCount: 0,
          skipped: true,
          message: `Checklist untuk nikah ${nikahType} sudah ada. Hapus terlebih dahulu jika ingin generate ulang.`,
        } as const;
      }

      const templates = NIKAH_BERKAS_TEMPLATES[nikahType];
      const categoryMap: Record<NikahType, string> = {
        SIPIL: "Nikah Sipil",
        AGAMA: "Nikah Agama",
        KUA: "Nikah KUA",
      };
      let documentCount = 0;

      for (const template of templates) {
        await tx.insert(documents).values({
          workspaceId,
          name: template.documentName,
          category: categoryMap[nikahType],
          documentDescription: template.documentDescription,
          isRequired: template.isRequired,
          isCompleted: false,
          nikahType,
        });
        documentCount++;
      }

      return {
        success: true,
        documentCount,
        skipped: false,
        message: `Berhasil generate ${documentCount} dokumen untuk nikah ${nikahType}.`,
      } as const;
    }
  );
}

export async function deleteChecklist(workspaceId: string, nikahType: NikahType) {
  return withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      await tx
        .delete(documents)
        .where(and(
          eq(documents.workspaceId, workspaceId),
          eq(documents.nikahType, nikahType)
        ));

      return {
        success: true,
        message: `Checklist nikah ${nikahType} berhasil dihapus.`,
      } as const;
    }
  );
}

export async function getChecklistByType(workspaceId: string, nikahType: NikahType) {
  return withWorkspace(
    { workspaceId },
    async (tx) => {
      return tx
        .select()
        .from(documents)
        .where(and(
          eq(documents.workspaceId, workspaceId),
          eq(documents.nikahType, nikahType)
        ))
        .orderBy(asc(documents.createdAt));
    }
  );
}

export async function getAllChecklist(workspaceId: string) {
  return withWorkspace(
    { workspaceId },
    async (tx) => {
      return tx
        .select()
        .from(documents)
        .where(and(
          eq(documents.workspaceId, workspaceId),
          isNotNull(documents.nikahType)
        ))
        .orderBy(asc(documents.nikahType), asc(documents.createdAt));
    }
  );
}

export async function getChecklistProgress(workspaceId: string) {
  return withWorkspace(
    { workspaceId },
    async (tx) => {
      const allDocs = await tx
        .select()
        .from(documents)
        .where(and(
          eq(documents.workspaceId, workspaceId),
          isNotNull(documents.nikahType)
        ));

      const totalDocs = allDocs.length;
      const completedDocs = allDocs.filter((d) => d.isCompleted).length;
      const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

      const groupedByType: Record<string, typeof allDocs> = {};
      for (const doc of allDocs) {
        const type = doc.nikahType ?? "Lainnya";
        if (!groupedByType[type]) {
          groupedByType[type] = [];
        }
        groupedByType[type].push(doc);
      }

      return {
        totalDocs,
        completedDocs,
        progressPercent,
        groupedByType,
      };
    }
  );
}
