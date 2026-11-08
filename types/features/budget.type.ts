/**
 * Budget feature types
 * Corresponds to: budgets, budgetCategories, expenses, expenseAttachments tables
 */

export interface Budget {
  id: string;
  workspaceId: string;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  id: string;
  workspaceId: string;
  name: string;
  allocatedAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  workspaceId: string;
  categoryId: string | null;
  amount: string;
  note: string | null;
  expenseDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string | null;
}

export interface ExpenseAttachment {
  id: string;
  expenseId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface BudgetSummary {
  totalBudget: string;
  totalSpent: string;
  remaining: string;
  percentageUsed: number;
  categories: BudgetCategorySummary[];
}

export interface BudgetCategorySummary {
  id: string;
  name: string;
  allocatedAmount: string;
  spentAmount: string;
  remaining: string;
  percentageUsed: number;
}
