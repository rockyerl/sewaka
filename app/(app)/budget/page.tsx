import Link from "next/link";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { format } from "date-fns";

import { auth } from "@/auth";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
  createExpenseAction,
  deleteExpenseAction,
  saveBudgetAction,
  saveBudgetCategoryAction,
} from "@/features/budget/actions";
import { BudgetSummary } from "@/features/budget/components";
import { getBudgetOverview } from "@/features/budget/queries";
import { listMyWorkspaces } from "@/features/workspaces/queries";

function formatCurrency(value: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}


async function BudgetPageContent({ workspaceId }: { workspaceId: string }) {
  const budget = await getBudgetOverview(workspaceId);
  const canEdit = true;

  const budgetPercentage =
    Number(budget.totalAmount) > 0
      ? Math.round((Number(budget.spentAmount) / Number(budget.totalAmount)) * 100)
      : 0;

  return (
    <>
      <section className="mb-6">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          KEUANGAN
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
              Kelola Anggaran
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Atur batas anggaran dan pantau pengeluaran pernikahanmu.
            </p>
          </div>
          <Link
            href="/budget/financial"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
          >
            <BarChart3 className="size-3.5 text-[#D4AF37]" />
            <span>Laporan Keuangan</span>
          </Link>
        </div>
      </section>

      {/* Total Budget */}
      <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Batas Anggaran</p>
            <p className="mt-1 font-serif text-2xl font-medium tracking-tight">
              {formatCurrency(budget.totalAmount)}
            </p>
          </div>
          {canEdit ? (
            <form action={saveBudgetAction} className="flex items-center gap-2">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <label className="sr-only" htmlFor="total-budget">Ubah anggaran</label>
              <input
                className="h-9 w-48 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="total-budget"
                name="totalAmount"
                type="number"
                min="0"
                step="1"
                placeholder="Total anggaran"
                defaultValue={budget.totalAmount}
                required
              />
              <Button type="submit" size="sm" className="h-9 rounded-lg">
                Simpan
              </Button>
            </form>
          ) : null}
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pengeluaran</span>
            <span>{budgetPercentage}%</span>
          </div>
          <Progress
            value={budgetPercentage}
            className="h-2 bg-[#eeeae3] [&_[data-slot=progress-indicator]]:bg-primary"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatCurrency(budget.spentAmount)} terpakai
            </span>
            <span
              className={`font-medium ${
                Number(budget.remainingAmount) < 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {formatCurrency(budget.remainingAmount)} sisa
            </span>
          </div>
        </div>
      </Card>

      {/* Budget Summary */}
      <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            RINCIAN KATEGORI
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">Kategori Anggaran</h2>
        </div>
        {budget.categories.length > 0 ? (
          <div className="mt-4 divide-y divide-border/60">
            {budget.categories.map((cat) => {
              const catPercentage =
                Number(cat.allocatedAmount) > 0
                  ? Math.round((Number(cat.spentAmount) / Number(cat.allocatedAmount)) * 100)
                  : 0;
              return (
                <div key={cat.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>
                        {formatCurrency(cat.spentAmount)} / {formatCurrency(cat.allocatedAmount)}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(catPercentage, 100)}
                    className={`mt-2 h-1.5 [&_[data-slot=progress-indicator]]:bg-primary ${
                      catPercentage > 100 ? "bg-[#f4e9e9]" : "bg-[#eeeae3]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada kategori anggaran.
          </p>
        )}
        {canEdit ? (
          <form
            action={saveBudgetCategoryAction}
            className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="category-name">Nama kategori</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="category-name"
              name="name"
              placeholder="Nama kategori"
              maxLength={100}
              required
            />
            <label className="sr-only" htmlFor="category-amount">Alokasi</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="category-amount"
              name="allocatedAmount"
              type="number"
              min="0"
              step="1"
              placeholder="Alokasi"
              required
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg">
              <Plus /> Tambah
            </Button>
          </form>
        ) : null}
      </Card>

      {/* Recent Expenses */}
      <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm shadow-stone-900/[0.025] sm:p-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            RIWAYAT PENGELUARAN
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">Pengeluaran Terbaru</h2>
        </div>
        {budget.recentExpenses.length > 0 ? (
          <div className="mt-4 divide-y divide-border/60">
            {budget.recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {expense.categoryName ?? "Tanpa kategori"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {expense.note ?? format(expense.expenseDate, "d MMM yyyy")}
                    {" · "}
                    {format(expense.expenseDate, "d MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-sm font-medium">{formatCurrency(expense.amount)}</span>
                  {canEdit ? (
                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="expenseId" value={expense.id} />
                      <ConfirmSubmitButton
                        confirmMessage="Hapus pengeluaran ini?"
                        aria-label="Hapus pengeluaran"
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada pengeluaran tercatat.
          </p>
        )}
        {canEdit ? (
          <form action={createExpenseAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label className="sr-only" htmlFor="expense-amount">Jumlah</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="expense-amount"
              name="amount"
              placeholder="Jumlah"
              type="number"
              min="0"
              step="1"
              required
            />
            <label className="sr-only" htmlFor="expense-note">Catatan</label>
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="expense-note"
              name="note"
              placeholder="Catatan (opsional)"
              maxLength={300}
            />
            <Button type="submit" variant="outline" className="h-9 rounded-lg">
              <Plus /> Tambah
            </Button>
          </form>
        ) : null}
      </Card>
    </>
  );
}

export const instant = false;

export default async function BudgetPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) return null;

  return <BudgetPageContent workspaceId={workspace.id} />;
}
