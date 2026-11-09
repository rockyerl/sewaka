import { z } from "zod";

export const createDocumentSchema = z.object({
  name: z.string().min(1, "Nama dokumen wajib diisi").max(200),
  category: z.string().min(1, "Kategori wajib diisi").max(100),
  fileSize: z.coerce.number().int().positive("Ukuran file harus lebih dari 0").optional(),
  mimeType: z.string().optional(),
  filePath: z.string().optional(),
  // Checklist fields
  documentDescription: z.string().optional(),
  isRequired: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  deadlineDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  nikahType: z.enum(["SIPIL", "AGAMA", "KUA"]).optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  isCompleted: z.boolean().optional(),
  fileUrl: z.string().optional(),
  notes: z.string().max(500).optional(),
  deadlineDate: z.string().optional().nullable(),
});

export const generateChecklistSchema = z.object({
  workspaceId: z.string().uuid(),
  nikahType: z.enum(["SIPIL", "AGAMA", "KUA"]),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type GenerateChecklistInput = z.infer<typeof generateChecklistSchema>;
