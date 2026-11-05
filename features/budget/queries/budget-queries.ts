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
    const budgetRows = await transaction
      .select({ totalAmount: budgets.totalAmount })
      .from(budgets)
      .where(eq(budgets.workspaceId, workspaceId))
      .limit(1);

    const spentRows = await transaction
      .select({
        spentAmount: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(expenses);

    const categories = await transaction
      .select({
        id: budgetCategories.id,
        name: budgetCategories.name,
        allocatedAmount: budgetCategories.allocatedAmount,
      })
      .from(budgetCategories)
      .orderBy(asc(budgetCategories.name));

    const categorySpend = await transaction
      .select({
        categoryId: expenses.categoryId,
        spentAmount: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(expenses)
      .groupBy(expenses.categoryId);

    const recentExpenses = await transaction
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
      .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt))
      .limit(6);

    const totalAmount = budgetRows[0]?.totalAmount ?? "0";
    const spentAmount = spentRows[0]?.spentAmount ?? "0";
    const spendByCategory = new Map(
      categorySpend.map(({ categoryId, spentAmount: amount }) => [
        categoryId,
        amount,
      ]),
    );

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
