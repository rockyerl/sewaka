import { z } from "zod";

export const taskIdSchema = z.string().uuid();
export const taskFormSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().trim().min(1, "Judul tugas wajib diisi").max(180),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  dueDate: z
    .string()
    .date()
    .optional()
    .transform((value) => (value ? new Date(`${value}T12:00:00.000Z`) : undefined)),
});

export const changeTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  taskId: taskIdSchema,
});

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const updateTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  taskId: taskIdSchema,
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
});
