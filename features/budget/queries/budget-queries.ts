import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { budgetCategories, budgets, expenses } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

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
  remainingAmount: string;
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
    // Fetch budget total
    const budgetRows = await transaction
      .select({ totalAmount: budgets.totalAmount })
      .from(budgets)
      .where(eq(budgets.workspaceId, workspaceId))
      .limit(1);

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

    // Calculate totals from the fetched expenses
    const totalAmount = budgetRows[0]?.totalAmount ?? "0";
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

    // Take only the 6 most recent expenses for display
    const recentExpenses = allExpenses.slice(0, 6);

    return {
      totalAmount,
      spentAmount,
      remainingAmount: fromCents(toCents(totalAmount) - toCents(spentAmount)),
      categories: categories.map((category) => ({
        ...category,
        spentAmount: spendByCategory.get(category.id) ?? "0",
      })),
      recentExpenses,
    };
  });
}
