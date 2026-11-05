"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { budgetCategories, budgets, expenses } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

import {
  budgetCategoryFormSchema,
  budgetFormSchema,
  deleteExpenseSchema,
  expenseFormSchema,
} from "../schemas/budget";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function saveBudgetAction(formData: FormData) {
  const input = budgetFormSchema.parse({
    workspaceId: formData.get("workspaceId"),
    totalAmount: formData.get("totalAmount"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      await transaction
        .insert(budgets)
        .values({
          workspaceId: input.workspaceId,
          totalAmount: input.totalAmount,
        })
        .onConflictDoUpdate({
          target: budgets.workspaceId,
          set: { totalAmount: input.totalAmount },
        });
    },
  );

  revalidatePath("/");
}

export async function saveBudgetCategoryAction(formData: FormData) {
  const input = budgetCategoryFormSchema.parse({
    workspaceId: formData.get("workspaceId"),
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    name: formData.get("name"),
    allocatedAmount: formData.get("allocatedAmount"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      if (input.categoryId) {
        const updated = await transaction
          .update(budgetCategories)
          .set({ name: input.name, allocatedAmount: input.allocatedAmount })
          .where(
            and(
              eq(budgetCategories.id, input.categoryId),
              eq(budgetCategories.workspaceId, input.workspaceId),
            ),
          )
          .returning({ id: budgetCategories.id });

        if (updated.length === 0) {
          throw new Error("Kategori tidak ditemukan di workspace ini.");
        }
      } else {
        await transaction.insert(budgetCategories).values({
          workspaceId: input.workspaceId,
          name: input.name,
          allocatedAmount: input.allocatedAmount,
        });
      }
    },
  );

  revalidatePath("/");
}

export async function createExpenseAction(formData: FormData) {
  const input = expenseFormSchema.parse({
    workspaceId: formData.get("workspaceId"),
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    amount: formData.get("amount"),
    note: String(formData.get("note") ?? "") || undefined,
    expenseDate: String(formData.get("expenseDate") ?? "") || undefined,
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      await transaction.insert(expenses).values({
        workspaceId: input.workspaceId,
        categoryId: input.categoryId || null,
        amount: input.amount,
        note: input.note || null,
        expenseDate: input.expenseDate ?? new Date(),
      });
    },
  );

  revalidatePath("/");
}

export async function deleteExpenseAction(formData: FormData) {
  const input = deleteExpenseSchema.parse({
    workspaceId: formData.get("workspaceId"),
    expenseId: formData.get("expenseId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const deleted = await transaction
        .delete(expenses)
        .where(
          and(
            eq(expenses.id, input.expenseId),
            eq(expenses.workspaceId, input.workspaceId),
          ),
        )
        .returning({ id: expenses.id });

      if (deleted.length === 0) {
        throw new Error("Pengeluaran tidak ditemukan di workspace ini.");
      }
    },
  );

  revalidatePath("/");
}
