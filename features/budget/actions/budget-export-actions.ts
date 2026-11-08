"use server";

import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { expenses, budgetCategories, budgets } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { requireFeature, SubscriptionLimitError } from "@/lib/utils/subscription-check";

/**
 * Export budget report to CSV (BGT-13) — Premium feature
 */
export async function exportBudgetReport(workspaceId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Financial reports are premium only
  try {
    await requireFeature(workspaceId, "financial_reports");
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
  }

  const db = getDb();

  // Get budget overview
  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.workspaceId, workspaceId))
    .limit(1);

  // Get all expenses with category names
  const allExpenses = await db
    .select({
      date: expenses.expenseDate,
      category: budgetCategories.name,
      amount: expenses.amount,
      note: expenses.note,
    })
    .from(expenses)
    .leftJoin(budgetCategories, eq(expenses.categoryId, budgetCategories.id))
    .where(eq(expenses.workspaceId, workspaceId));

  // Get category summary
  const categorySummary = await db
    .select({
      category: budgetCategories.name,
      allocated: budgetCategories.allocatedAmount,
      spent: sql<string>`coalesce(sum(${expenses.amount}), '0')`,
    })
    .from(budgetCategories)
    .leftJoin(expenses, eq(expenses.categoryId, budgetCategories.id))
    .where(eq(budgetCategories.workspaceId, workspaceId))
    .groupBy(budgetCategories.id, budgetCategories.name, budgetCategories.allocatedAmount);

  // Generate CSV
  const lines: string[] = [];

  // Summary section
  lines.push("LAPORAN ANGGARAN");
  lines.push("");
  lines.push("Ringkasan");
  lines.push(`Total Anggaran,${budget?.totalAmount ?? "0"}`);
  lines.push(`Total Pengeluaran,${allExpenses.reduce((sum, e) => sum + Number(e.amount), 0)}`);
  lines.push(`Sisa,${(Number(budget?.totalAmount ?? "0") - allExpenses.reduce((sum, e) => sum + Number(e.amount), 0))}`);
  lines.push("");

  // Category breakdown
  lines.push("Per Kategori");
  lines.push("Kategori,Alokasi,Pengeluaran,Sisa");
  for (const cat of categorySummary) {
    const allocated = Number(cat.allocated);
    const spent = Number(cat.spent);
    lines.push(`${cat.category},${allocated},${spent},${allocated - spent}`);
  }
  lines.push("");

  // Expense details
  lines.push("Detail Pengeluaran");
  lines.push("Tanggal,Kategori,Jumlah,Catatan");
  for (const exp of allExpenses) {
    lines.push(
      [
        exp.date ? exp.date.toISOString().split("T")[0] : "",
        `"${(exp.category ?? "Tanpa kategori").replace(/"/g, '""')}"`,
        exp.amount,
        `"${(exp.note ?? "").replace(/"/g, '""')}"`,
      ].join(","),
    );
  }

  return lines.join("\n");
}
