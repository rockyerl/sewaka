import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { budgetCategories, budgetEntries, budgets, culturalSeserahanItems, expenses, vendorPayments } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

function toCents(amount: string) {
  const [whole, fraction = ""] = amount.split(".");
  return BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}

function fromCents(amount: bigint) {
  const hundred = BigInt(100);
  const isNegative = amount < BigInt(0);
  const absoluteAmount = isNegative ? -amount : amount;
  const formatted = `${absoluteAmount / hundred}.${String(
    absoluteAmount % hundred,
  ).padStart(2, "0")}`;

  return isNegative ? `-${formatted}` : formatted;
}

export type BudgetOverview = {
  totalAmount: string;
  spentAmount: string;
  seserahanActualCost: string;
  seserahanEstimatedCost: string;
  vendorPaymentsTotal: string;
  remainingAmount: string;
  budgetEntries: {
    id: string;
    amount: string;
    entryDate: Date;
    description: string | null;
  }[];
  categories: {
    id: string;
    name: string;
    allocatedAmount: string;
    spentAmount: string;
  }[];
  recentExpenses: {
    id: string;
    categoryId: string | null;
    categoryName: string | null;
    amount: string;
    note: string | null;
    expenseDate: Date;
  }[];
};

export async function getBudgetOverview(
  workspaceId: string,
  userId?: string,
): Promise<BudgetOverview> {
  return withWorkspace({ workspaceId, userId }, async (transaction) => {
    // Fetch budget entries for this workspace
    const entriesRows = await transaction
      .select({
        id: budgetEntries.id,
        amount: budgetEntries.amount,
        entryDate: budgetEntries.entryDate,
        description: budgetEntries.description,
      })
      .from(budgetEntries)
      .where(eq(budgetEntries.workspaceId, workspaceId))
      .orderBy(desc(budgetEntries.entryDate), desc(budgetEntries.createdAt));

    // Calculate total budget from all entries
    let totalAmountFromEntries = "0";
    for (const entry of entriesRows) {
      totalAmountFromEntries = fromCents(toCents(totalAmountFromEntries) + toCents(entry.amount));
    }

    // Also fetch legacy budget total for backward compatibility
    const budgetRows = await transaction
      .select({ totalAmount: budgets.totalAmount })
      .from(budgets)
      .where(eq(budgets.workspaceId, workspaceId))
      .limit(1);

    // Use entries total if available, otherwise fall back to legacy budget total
    const totalAmount = totalAmountFromEntries !== "0"
      ? totalAmountFromEntries
      : (budgetRows[0]?.totalAmount ?? "0");

    // Fetch categories with their allocated amounts
    const categories = await transaction
      .select({
        id: budgetCategories.id,
        name: budgetCategories.name,
        allocatedAmount: budgetCategories.allocatedAmount,
      })
      .from(budgetCategories)
      .where(eq(budgetCategories.workspaceId, workspaceId))
      .orderBy(asc(budgetCategories.name));

    // Fetch expenses for this workspace only, with category info, ordered by date
    // This single query replaces the separate spent, categorySpend, and recentExpenses queries
    const allExpenses = await transaction
      .select({
        id: expenses.id,
        categoryId: expenses.categoryId,
        categoryName: budgetCategories.name,
        amount: expenses.amount,
        note: expenses.note,
        expenseDate: expenses.expenseDate,
      })
      .from(expenses)
      .leftJoin(budgetCategories, eq(expenses.categoryId, budgetCategories.id))
      .where(eq(expenses.workspaceId, workspaceId))
      .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));

    // Fetch seserahan items for this workspace
    const seserahanItems = await transaction
      .select({
        estimatedCost: culturalSeserahanItems.estimatedCost,
        actualCost: culturalSeserahanItems.actualCost,
      })
      .from(culturalSeserahanItems)
      .where(eq(culturalSeserahanItems.workspaceId, workspaceId));

    // Calculate seserahan totals
    let seserahanEstimatedCost = "0";
    let seserahanActualCost = "0";
    for (const item of seserahanItems) {
      seserahanEstimatedCost = fromCents(toCents(seserahanEstimatedCost) + toCents(item.estimatedCost));
      seserahanActualCost = fromCents(toCents(seserahanActualCost) + toCents(item.actualCost));
    }

    // Fetch vendor payments for this workspace
    const vendorPaymentRows = await transaction
      .select({
        amount: vendorPayments.amount,
      })
      .from(vendorPayments)
      .where(eq(vendorPayments.workspaceId, workspaceId));

    // Calculate vendor payments total
    let vendorPaymentsTotal = "0";
    for (const payment of vendorPaymentRows) {
      vendorPaymentsTotal = fromCents(toCents(vendorPaymentsTotal) + toCents(payment.amount));
    }

    // Calculate totals from the fetched expenses
    let spentAmount = "0";
    const spendByCategory = new Map<string, string>();

    for (const exp of allExpenses) {
      // Add to total spent
      spentAmount = fromCents(toCents(spentAmount) + toCents(exp.amount));
      // Add to category spent
      if (exp.categoryId) {
        const current = spendByCategory.get(exp.categoryId) ?? "0";
        spendByCategory.set(exp.categoryId, fromCents(toCents(current) + toCents(exp.amount)));
      }
    }

    // Add seserahan actual cost and vendor payments to total spent
    const totalSpentAmount = fromCents(toCents(spentAmount) + toCents(seserahanActualCost) + toCents(vendorPaymentsTotal));

    // Take only the 6 most recent expenses for display
    const recentExpenses = allExpenses.slice(0, 6);

    return {
      totalAmount,
      spentAmount: totalSpentAmount,
      seserahanActualCost,
      seserahanEstimatedCost,
      vendorPaymentsTotal,
      remainingAmount: fromCents(toCents(totalAmount) - toCents(totalSpentAmount)),
      budgetEntries: entriesRows,
      categories: categories.map((category) => ({
        ...category,
        spentAmount: spendByCategory.get(category.id) ?? "0",
      })),
      recentExpenses,
    };
  });
}
