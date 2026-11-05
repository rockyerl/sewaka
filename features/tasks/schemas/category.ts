import { z } from "zod";

export const createTaskCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  description: z.string().max(500).optional(),
  color: z.string().length(7).regex(/^#/).optional(),
});

export const updateTaskCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullish(),
  color: z.string().length(7).regex(/^#/).nullish(),
});

export type CreateTaskCategoryInput = z.infer<typeof createTaskCategorySchema>;
export type UpdateTaskCategoryInput = z.infer<typeof updateTaskCategorySchema>;
