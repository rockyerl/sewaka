import Link from "next/link";
import { BarChart3, Calendar, FileText, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CurrencyInput } from "@/components/forms/currency-input";
import { PageHeader } from "@/components/shared/page-components";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateIndonesia } from "@/components/ui/date-badge";

import { addBudgetEntryAction, deleteBudgetEntryAction } from "@/features/budget/actions/budget-actions";
import { getBudgetOverview } from "@/features/budget/hooks/budget-queries";
import { BudgetTabs } from "./budget-tabs";

export async function BudgetPageContent({ workspaceId }: { workspaceId: string }) {
  const budget = await getBudgetOverview(workspaceId);
  const canEdit = true;

  const budgetPercentage =
    Number(budget.totalAmount) > 0
      ? Math.round((Number(budget.spentAmount) / Number(budget.totalAmount)) * 100)
      : 0;

  return (
    <>
      <PageHeader
        eyebrow="KEUANGAN"
        title="Kelola Anggaran"
        description="Atur batas anggaran dan pantau pengeluaran pernikahanmu."
        actions={
          <Link
            href="/budget/financial"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF5EC]/60 px-3 py-2 text-xs font-medium text-[#5B132B] shadow-xs hover:bg-[#FAF5EC]"
          >
            <BarChart3 className="size-3.5 text-[#D4AF37]" />
            <span>Laporan Keuangan</span>
          </Link>
        }
      />

      {/* Budget Overview Hero */}
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#5B132B]/10 shadow-lg shadow-[#5B132B]/5">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B132B] via-[#7a2a4a] to-[#5B132B] opacity-[0.03]" />
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-[#527553]/10 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          {/* Header row — Total from entries */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B132B] to-[#7a2a4a] shadow-sm">
                <Wallet className="size-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a08f74]">Total Anggaran</p>
                <p className="font-serif text-xl font-semibold tracking-tight text-[#5B132B]">
                  {formatCurrency(budget.totalAmount)}
                </p>
                {budget.budgetEntries.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">{budget.budgetEntries.length} entri anggaran</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress section */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pengeluaran</span>
              <span className={`font-semibold ${budgetPercentage > 90 ? "text-[#5B132B]" : budgetPercentage > 70 ? "text-[#D4AF37]" : "text-[#527553]"}`}>
                {budgetPercentage}%
              </span>
            </div>
            <Progress
              value={Math.min(budgetPercentage, 100)}
              className={`h-2.5 rounded-full bg-[#eeeae3] [&_[data-slot=progress-indicator]]:rounded-full ${
                budgetPercentage > 90
                  ? '[&_[data-slot=progress-indicator]]:bg-gradient-to-r from-[#5B132B] to-[#7a2a4a]'
                  : budgetPercentage > 70
                    ? '[&_[data-slot=progress-indicator]]:bg-gradient-to-r from-[#D4AF37] to-[#c5a849]'
                    : '[&_[data-slot=progress-indicator]]:bg-gradient-to-r from-[#527553] to-[#7a9e7a]'
              }`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{formatCurrency(budget.spentAmount)} terpakai</span>
              <span className={`font-semibold ${Number(budget.remainingAmount) < 0 ? "text-[#5B132B]" : "text-[#527553]"}`}>
                {formatCurrency(budget.remainingAmount)} sisa
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#527553]/20 bg-gradient-to-br from-[#f0f5ed] to-[#faf8f5] p-3">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="size-3.5 text-[#527553]" />
                <span className="text-[10px] font-medium text-muted-foreground">Total Keluar</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#527553]">{formatCurrency(budget.spentAmount)}</p>
              {(Number(budget.seserahanActualCost) > 0 || Number(budget.vendorPaymentsTotal) > 0) && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {Number(budget.seserahanActualCost) > 0 && `seserahan ${formatCurrency(budget.seserahanActualCost)}`}
                  {Number(budget.seserahanActualCost) > 0 && Number(budget.vendorPaymentsTotal) > 0 && " + "}
                  {Number(budget.vendorPaymentsTotal) > 0 && `vendor ${formatCurrency(budget.vendorPaymentsTotal)}`}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#fff9ee] to-[#faf8f5] p-3">
              <div className="flex items-center gap-1.5">
                <Wallet className="size-3.5 text-[#D4AF37]" />
                <span className="text-[10px] font-medium text-muted-foreground">Sisa Anggaran</span>
              </div>
              <p className={`mt-1 text-sm font-semibold ${Number(budget.remainingAmount) < 0 ? "text-[#5B132B]" : "text-[#9b7922]"}`}>
                {formatCurrency(budget.remainingAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-[#5B132B]/20 bg-gradient-to-br from-[#faf0f3] to-[#faf8f5] p-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-[#5B132B]" />
                <span className="text-[10px] font-medium text-muted-foreground">Kategori</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#5B132B]">{budget.categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Entries Section */}
      <div className="rounded-2xl border border-[#5B132B]/10 bg-white shadow-sm">
        {/* Section Header */}
        <div className="border-b border-[#5B132B]/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#FAF5EC]">
                <Calendar className="size-3.5 text-[#5B132B]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#5B132B]">Riwayat Anggaran</h3>
                <p className="text-[10px] text-muted-foreground">Daftar anggaran dasar dan tambahan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {canEdit && (
          <div className="border-b border-[#5B132B]/10 bg-[#FAF5EC]/30 px-5 py-4">
            <form action={addBudgetEntryAction} className="space-y-3">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-48">
                  <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground" htmlFor="entry-date">
                    <Calendar className="size-3" />
                    Tanggal
                  </label>
                  <input
                    type="date"
                    id="entry-date"
                    name="entryDate"
                    required
                    defaultValue="2026-10-13"
                    className="w-full rounded-lg border border-[#E6D5B8] bg-white px-3 py-2 text-sm shadow-xs focus:border-[#5B132B] focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground" htmlFor="entry-amount">
                    <Wallet className="size-3" />
                    Jumlah
                  </label>
                  <CurrencyInput
                    id="entry-amount"
                    name="amount"
                    value=""
                    placeholder="1.000.000"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground" htmlFor="entry-description">
                    <FileText className="size-3" />
                    Keterangan
                  </label>
                  <input
                    type="text"
                    id="entry-description"
                    name="description"
                    placeholder="Anggaran dasar"
                    className="w-full rounded-lg border border-[#E6D5B8] bg-white px-3 py-2 text-sm shadow-xs focus:border-[#5B132B] focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-[#5B132B] to-[#7a2a4a] shadow-sm hover:shadow-md"
                  >
                    <Plus className="size-3.5" />
                    Tambah
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div className="px-5 py-4">
          {budget.budgetEntries.length > 0 ? (
            <div className="space-y-2">
              {budget.budgetEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between rounded-xl border border-[#E6D5B8]/50 bg-[#FAF5EC]/20 px-4 py-3 transition-colors hover:bg-[#FAF5EC]/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF5EC] border border-[#E6D5B8]">
                      <Calendar className="size-3.5 text-[#5B132B]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatDateIndonesia(entry.entryDate, { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <p className="font-serif text-sm font-semibold text-[#5B132B] whitespace-nowrap">
                      {formatCurrency(entry.amount)}
                    </p>
                    <form action={deleteBudgetEntryAction} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="entryId" value={entry.id} />
                      <button
                        type="submit"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Hapus entri"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#FAF5EC]/60">
                <Wallet className="size-5 text-[#a08f74]" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Belum ada entri anggaran</p>
              <p className="text-xs text-muted-foreground mt-1">Tambahkan anggaran dasar atau tambahan di form atas</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Tabs: Categories & Expenses */}
      <BudgetTabs
        categories={budget.categories}
        expenses={budget.recentExpenses}
        workspaceId={workspaceId}
        canEdit={canEdit}
        totalBudget={Number(budget.totalAmount)}
      />
    </>
  );
}
