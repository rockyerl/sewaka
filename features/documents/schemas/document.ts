import { z } from "zod";

export const createDocumentSchema = z.object({
  name: z.string().min(1, "Nama dokumen wajib diisi").max(200),
  category: z.string().min(1, "Kategori wajib diisi").max(100),
  fileSize: z.coerce.number().int().positive("Ukuran file harus lebih dari 0"),
  mimeType: z.string().min(1, "Tipe MIME wajib diisi"),
  filePath: z.string().min(1, "Path file wajib diisi"),
});

export const updateDocumentSchema = z.object({
  name: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
