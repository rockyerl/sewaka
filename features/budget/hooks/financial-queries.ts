import "server-only";

import { eq } from "drizzle-orm";

import { withWorkspace } from "@/lib/db/with-workspace";
import { budgets, budgetCategories, culturalSeserahanItems, expenses, vendorPayments } from "@/lib/db/schema";

export type FinancialReport = {
  totalBudget: string;
  totalEstimated: string;
  totalActual: string;
  totalVendorPayments: string;
  totalSeserahanEstimated: string;
  totalSeserahanActual: string;
  remaining: string;
  byCategory: {
    categoryName: string;
    allocated: string;
    spent: string;
    vendorPayments: string;
    remaining: string;
    expenseCount: number;
    percentage: number;
  }[];
  recentExpenses: {
    id: string;
    amount: string;
    note: string | null;
    expenseDate: Date;
    categoryName: string | null;
  }[];
};

export async function getFinancialReport(
  workspaceId: string,
  userId?: string,
): Promise<FinancialReport> {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    // Get budget
    const [budget] = await tx
      .select({ totalAmount: budgets.totalAmount })
      .from(budgets)
      .where(eq(budgets.workspaceId, workspaceId))
      .limit(1);

    const totalBudget = budget?.totalAmount ?? "0";

    // Get categories
    const categories = await tx
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.workspaceId, workspaceId));

    // Get expenses
    const allExpenses = await tx
      .select({
        id: expenses.id,
        amount: expenses.amount,
        note: expenses.note,
        expenseDate: expenses.expenseDate,
        categoryId: expenses.categoryId,
      })
      .from(expenses)
      .where(eq(expenses.workspaceId, workspaceId));

    // Get vendor payments
    const allVendorPayments = await tx
      .select({
        amount: vendorPayments.amount,
      })
      .from(vendorPayments)
      .where(eq(vendorPayments.workspaceId, workspaceId));

    const totalVendorPayments = allVendorPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Get seserahan items
    const allSeserahanItems = await tx
      .select({
        estimatedCost: culturalSeserahanItems.estimatedCost,
        actualCost: culturalSeserahanItems.actualCost,
      })
      .from(culturalSeserahanItems)
      .where(eq(culturalSeserahanItems.workspaceId, workspaceId));

    const totalSeserahanEstimated = allSeserahanItems.reduce(
      (sum, item) => sum + Number(item.estimatedCost),
      0,
    );
    const totalSeserahanActual = allSeserahanItems.reduce(
      (sum, item) => sum + Number(item.actualCost),
      0,
    );

    // Build category breakdown
    const byCategory = categories.map((cat) => {
      const catExpenses = allExpenses.filter((e) => e.categoryId === cat.id);
      const spent = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const allocated = Number(cat.allocatedAmount);
      const remaining = allocated - spent;
      const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

      return {
        categoryName: cat.name,
        allocated: String(cat.allocatedAmount),
        spent: String(spent),
        vendorPayments: "0",
        remaining: String(remaining),
        expenseCount: catExpenses.length,
        percentage,
      };
    });

    // Add uncategorized expenses
    const uncategorizedExpenses = allExpenses.filter((e) => !e.categoryId);
    const uncategorizedSpent = uncategorizedExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    if (uncategorizedSpent > 0) {
      byCategory.push({
        categoryName: "Tanpa Kategori",
        allocated: "0",
        spent: String(uncategorizedSpent),
        vendorPayments: "0",
        remaining: String(-uncategorizedSpent),
        expenseCount: uncategorizedExpenses.length,
        percentage: 0,
      });
    }

    const totalExpensesActual = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Total actual includes expenses + seserahan actual costs + vendor payments
    const totalActual = totalExpensesActual + totalSeserahanActual + totalVendorPayments;

    // Recent expenses (last 10)
    const recentExpenses = allExpenses
      .sort((a, b) => b.expenseDate.getTime() - a.expenseDate.getTime())
      .slice(0, 10)
      .map((exp) => {
        const cat = categories.find((c) => c.id === exp.categoryId);
        return {
          id: exp.id,
          amount: exp.amount,
          note: exp.note,
          expenseDate: exp.expenseDate,
          categoryName: cat?.name ?? null,
        };
      });

    return {
      totalBudget,
      totalEstimated: String(totalSeserahanEstimated),
      totalActual: String(totalActual),
      totalVendorPayments: String(totalVendorPayments),
      totalSeserahanEstimated: String(totalSeserahanEstimated),
      totalSeserahanActual: String(totalSeserahanActual),
      remaining: String(Number(totalBudget) - totalActual),
      byCategory,
      recentExpenses,
    };
  });
}
