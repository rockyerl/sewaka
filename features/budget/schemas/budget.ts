import { z } from "zod";

export const budgetAmountSchema = z
  .string()
  .trim()
  .regex(/^(0|[1-9]\d{0,11})(\.\d{1,2})?$/, "Masukkan nominal yang valid")
  .transform((value) => {
    const [whole, fraction = ""] = value.split(".");
    return `${whole}.${fraction.padEnd(2, "0")}`;
  });

export const expenseAmountSchema = budgetAmountSchema.refine(
  (value) => value !== "0.00",
  "Pengeluaran harus lebih dari Rp 0",
);

export const budgetFormSchema = z.object({
  workspaceId: z.string().uuid(),
  totalAmount: budgetAmountSchema,
});

export const budgetCategoryFormSchema = z.object({
  workspaceId: z.string().uuid(),
  categoryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
  allocatedAmount: budgetAmountSchema,
});

export const expenseFormSchema = z.object({
  workspaceId: z.string().uuid(),
  categoryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  amount: expenseAmountSchema,
  note: z.string().trim().max(500).optional(),
  expenseDate: z
    .string()
    .date()
    .optional()
    .transform((value) => (value ? new Date(`${value}T12:00:00.000Z`) : undefined)),
});

export const deleteExpenseSchema = z.object({
  workspaceId: z.string().uuid(),
  expenseId: z.string().uuid(),
});
