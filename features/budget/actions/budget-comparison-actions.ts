"use server";

import { eq, sum, and } from "drizzle-orm";
import { getDb } from "@/db";
import { budgetCategories, expenses, vendors, vendorPayments } from "@/db/schema";

/**
 * Get budget comparison data (BGT-12)
 * Compares estimated vs actual costs per category
 */
export async function getBudgetComparison(workspaceId: string) {
  const db = getDb();

  // Get all budget categories with their allocated amounts
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.workspaceId, workspaceId));

  // Get all expenses
  const expensesList = await db
    .select()
    .from(expenses)
    .where(eq(expenses.workspaceId, workspaceId));

  // Get all vendor payments
  const payments = await db
    .select()
    .from(vendorPayments)
    .where(eq(vendorPayments.workspaceId, workspaceId));

  // Calculate actual costs per category
  const categoryComparison = categories.map((category) => {
    // Expenses for this category
    const categoryExpenses = expensesList.filter(
      (expense) => expense.categoryId === category.id
    );

    // Vendor payments for this category (vendorPayments doesn't have categoryId, skip for now)
    const categoryPayments = [] as typeof payments;

    const actualExpenses = categoryExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    const actualPayments = categoryPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const actualTotal = actualExpenses + actualPayments;
    const allocated = Number(category.allocatedAmount);
    const remaining = allocated - actualTotal;
    const percentage = allocated > 0 ? (actualTotal / allocated) * 100 : 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      allocated,
      actual: actualTotal,
      remaining,
      percentage: Math.min(percentage, 100),
      overBudget: actualTotal > allocated,
      overBudgetAmount: Math.max(0, actualTotal - allocated),
    };
  });

  // Calculate totals
  const totalAllocated = categoryComparison.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalActual = categoryComparison.reduce((sum, cat) => sum + cat.actual, 0);
  const totalRemaining = totalAllocated - totalActual;
  const totalPercentage = totalAllocated > 0 ? (totalActual / totalAllocated) * 100 : 0;

  return {
    categories: categoryComparison,
    totals: {
      allocated: totalAllocated,
      actual: totalActual,
      remaining: totalRemaining,
      percentage: Math.min(totalPercentage, 100),
      overBudget: totalActual > totalAllocated,
      overBudgetAmount: Math.max(0, totalActual - totalAllocated),
    },
  };
}
