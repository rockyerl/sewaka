"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { budgetCategories, budgetEntries, budgets, expenses } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

import {
  budgetCategoryFormSchema,
  budgetEntryFormSchema,
  budgetFormSchema,
  deleteBudgetEntrySchema,
  deleteCategorySchema,
  deleteExpenseSchema,
  expenseFormSchema,
  updateExpenseSchema,
} from "../actions/budget-schema";
import { getCategoryLabel } from "@/lib/constants/wedding-categories";

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
      // categoryId dari form bisa berupa enum key (KATERING, DEKORASI, dll) atau UUID
      // Jika enum key, cari budget category yang sesuai di workspace
      let resolvedCategoryId = input.categoryId || null;
      if (resolvedCategoryId && !resolvedCategoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // Ini adalah enum key, cari budget category
        const categoryRow = await transaction
          .select({ id: budgetCategories.id })
          .from(budgetCategories)
          .where(
            and(
              eq(budgetCategories.workspaceId, input.workspaceId),
              eq(budgetCategories.name, resolvedCategoryId),
            ),
          )
          .limit(1);
        resolvedCategoryId = categoryRow[0]?.id || null;
      }

      await transaction.insert(expenses).values({
        workspaceId: input.workspaceId,
        categoryId: resolvedCategoryId,
        amount: input.amount,
        note: input.note || null,
        expenseDate: input.expenseDate ?? new Date(),
      });
    },
  );

  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData) {
  const input = deleteCategorySchema.parse({
    workspaceId: formData.get("workspaceId"),
    categoryId: formData.get("categoryId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const deleted = await transaction
        .delete(budgetCategories)
        .where(
          and(
            eq(budgetCategories.id, input.categoryId),
            eq(budgetCategories.workspaceId, input.workspaceId),
          ),
        )
        .returning({ id: budgetCategories.id });

      if (deleted.length === 0) {
        throw new Error("Kategori tidak ditemukan di workspace ini.");
      }
    },
  );

  revalidatePath("/");
}

export async function updateExpenseAction(formData: FormData) {
  const input = updateExpenseSchema.parse({
    workspaceId: formData.get("workspaceId"),
    expenseId: formData.get("expenseId"),
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    amount: formData.get("amount"),
    note: String(formData.get("note") ?? "") || undefined,
    expenseDate: String(formData.get("expenseDate") ?? "") || undefined,
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      // categoryId dari form bisa berupa enum key (KATERING, DEKORASI, dll) atau UUID
      let resolvedCategoryId = input.categoryId || null;
      if (resolvedCategoryId && !resolvedCategoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const categoryRow = await transaction
          .select({ id: budgetCategories.id })
          .from(budgetCategories)
          .where(
            and(
              eq(budgetCategories.workspaceId, input.workspaceId),
              eq(budgetCategories.name, resolvedCategoryId),
            ),
          )
          .limit(1);
        resolvedCategoryId = categoryRow[0]?.id || null;
      }

      const updated = await transaction
        .update(expenses)
        .set({
          categoryId: resolvedCategoryId,
          amount: input.amount,
          note: input.note || null,
          expenseDate: input.expenseDate ?? new Date(),
        })
        .where(
          and(
            eq(expenses.id, input.expenseId),
            eq(expenses.workspaceId, input.workspaceId),
          ),
        )
        .returning({ id: expenses.id });

      if (updated.length === 0) {
        throw new Error("Pengeluaran tidak ditemukan di workspace ini.");
      }
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

export async function addBudgetEntryAction(formData: FormData) {
  const input = budgetEntryFormSchema.parse({
    workspaceId: formData.get("workspaceId"),
    amount: formData.get("amount"),
    entryDate: formData.get("entryDate"),
    description: String(formData.get("description") ?? "") || undefined,
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      await transaction.insert(budgetEntries).values({
        workspaceId: input.workspaceId,
        amount: input.amount,
        entryDate: input.entryDate,
        description: input.description || null,
      });
    },
  );

  revalidatePath("/budget");
  revalidatePath("/budget/financial");
  revalidatePath("/dashboard");
}

export async function deleteBudgetEntryAction(formData: FormData) {
  const input = deleteBudgetEntrySchema.parse({
    workspaceId: formData.get("workspaceId"),
    entryId: formData.get("entryId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (transaction) => {
      const deleted = await transaction
        .delete(budgetEntries)
        .where(
          and(
            eq(budgetEntries.id, input.entryId),
            eq(budgetEntries.workspaceId, input.workspaceId),
          ),
        )
        .returning({ id: budgetEntries.id });

      if (deleted.length === 0) {
        throw new Error("Entri anggaran tidak ditemukan di workspace ini.");
      }
    },
  );

  revalidatePath("/budget");
  revalidatePath("/budget/financial");
  revalidatePath("/dashboard");
}
