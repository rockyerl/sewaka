import { z } from "zod";
import { weddingCategoryEnum } from "@/lib/constants/wedding-categories";

export const budgetAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,14}(\.\d{1,2})?$/, "Masukkan nominal yang valid")
  .transform((value) => {
    // Hapus titik ribuan jika ada (format 10.000.000 -> 10000000)
    const cleaned = value.replace(/\./g, "");
    const num = Number(cleaned);
    if (isNaN(num) || num < 0 || num > 99999999999999) {
      throw new Error("Masukkan nominal yang valid");
    }
    // Simpan sebagai string dengan 2 desimal untuk database (numeric type)
    return num.toFixed(2);
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
  name: weddingCategoryEnum,
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

export const updateExpenseSchema = z.object({
  workspaceId: z.string().uuid(),
  expenseId: z.string().uuid(),
  categoryId: z.union([z.literal(""), z.string().uuid()]).optional(),
  amount: expenseAmountSchema,
  note: z.string().trim().max(500).optional(),
  expenseDate: z
    .string()
    .date()
    .optional()
    .transform((value) => (value ? new Date(`${value}T12:00:00.000Z`) : undefined)),
});

export const deleteCategorySchema = z.object({
  workspaceId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

export const budgetEntryFormSchema = z.object({
  workspaceId: z.string().uuid(),
  amount: expenseAmountSchema,
  entryDate: z
    .string()
    .date()
    .transform((value) => new Date(`${value}T12:00:00.000Z`)),
  description: z.string().trim().max(500).optional(),
});

export const deleteBudgetEntrySchema = z.object({
  workspaceId: z.string().uuid(),
  entryId: z.string().uuid(),
});
