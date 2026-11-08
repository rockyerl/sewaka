import { ArrowUpRight, Download, Gift, Wallet } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SectionCard, StatCard } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { formatCurrency } from "@/lib/utils/format-currency";

import { exportBudgetReport } from "@/features/budget/actions/budget-export-actions";
import { getFinancialReport } from "@/features/budget/hooks/financial-queries";

export async function exportBudgetReportAction(formData: FormData) {
  "use server";
  const workspaceId = formData.get("workspaceId") as string;
  await exportBudgetReport(workspaceId);
}

export async function FinancialPageContent({ workspaceId }: { workspaceId: string }) {
  const report = await getFinancialReport(workspaceId);

  const remaining = Number(report.remaining);
  const totalBudget = Number(report.totalBudget);
  const totalSpent = Number(report.totalActual);
  const budgetPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="KEUANGAN"
        title="Laporan Keuangan"
        description="Lihat perbandingan anggaran dan pengeluaran pernikahanmu."
        actions={
          <>
            <Button asChild variant="outline" className="w-fit gap-2 rounded-lg px-4">
              <Link href="/budget">Kelola Anggaran</Link>
            </Button>
            <form action={exportBudgetReportAction}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <Button type="submit" variant="outline" className="gap-2 rounded-lg px-4">
                <Download className="size-4" /> Export CSV
              </Button>
            </form>
          </>
        }
      />

      {/* Stats Grid */}
      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Statistik keuangan">
        <StatCard
          label="Total Anggaran"
          value={formatCurrency(report.totalBudget)}
          icon={Wallet}
          iconClass="bg-[#f1e7d8] text-primary"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatCurrency(report.totalActual)}
          icon={Wallet}
          iconClass="bg-[#f4e9e9] text-[#9b4a4a]"
          trend="down"
          detail={`seserahan ${formatCurrency(report.totalSeserahanActual)} + vendor ${formatCurrency(report.totalVendorPayments)}`}
        />
        <StatCard
          label="Sisa Anggaran"
          value={formatCurrency(report.remaining)}
          icon={Wallet}
          iconClass={remaining >= 0 ? "bg-[#edf3e9] text-[#527553]" : "bg-[#f4e9e9] text-[#9b4a4a]"}
          trend={remaining >= 0 ? "up" : "down"}
        />
      </section>

      {/* Budget Progress */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Penggunaan Anggaran</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(report.totalActual)} dari {formatCurrency(report.totalBudget)}
            </p>
          </div>
          <span
            className={`text-lg font-medium ${
              budgetPercentage > 100 ? "text-[#9b4a4a]" : "text-primary"
            }`}
          >
            {budgetPercentage}%
          </span>
        </div>
        <Progress
          value={Math.min(budgetPercentage, 100)}
          className={`h-2 bg-[#eeeae3] [&_[data-slot=progress-indicator]]:${
            budgetPercentage > 100 ? "bg-[#9b4a4a]" : "bg-primary"
          }`}
        />
        {budgetPercentage > 100 && (
          <p className="flex items-center gap-1 text-xs text-[#9b4a4a]">
            <ArrowUpRight className="size-3.5" /> Melebihi anggaran {formatCurrency(String(Math.abs(remaining)))}
          </p>
        )}
      </Card>

      {/* By Category */}
      <SectionCard eyebrow="PER KATEGORI" title="Perbandingan Anggaran per Kategori">
        {report.byCategory.length > 0 ? (
          <div className="mt-4 space-y-4">
            {report.byCategory.map((cat) => {
              const allocated = Number(cat.allocated);
              const spent = Number(cat.spent);
              const isOverBudget = allocated > 0 && spent > allocated;
              const catPercentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

              return (
                <div key={cat.categoryName} className="rounded-lg border border-border/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{cat.categoryName}</h3>
                      {isOverBudget && (
                        <Badge variant="secondary" className="rounded-full bg-[#f4e9e9] text-[#9b4a4a] text-[10px]">
                          Melebihi
                        </Badge>
                      )}
                      <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground text-[10px]">
                        {cat.expenseCount} pengeluaran
                      </Badge>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isOverBudget ? "text-[#9b4a4a]" : "text-muted-foreground"
                      }`}
                    >
                      {catPercentage}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(catPercentage, 100)}
                    className={`h-1.5 mb-2 ${
                      isOverBudget
                        ? "[&_[data-slot=progress-indicator]]:bg-[#9b4a4a]"
                        : "[&_[data-slot=progress-indicator]]:bg-primary"
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                    </span>
                    <span
                      className={
                        isOverBudget ? "text-[#9b4a4a] font-medium" : "text-muted-foreground"
                      }
                    >
                      Sisa: {formatCurrency(cat.remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada kategori budget. Buat kategori di halaman anggaran.
          </p>
        )}
      </SectionCard>

      {/* Seserahan & Vendor Costs */}
      <SectionCard eyebrow="BIAYA TAMBAHAN" title="Biaya Seserahan & Pembayaran Vendor">
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Card className="rounded-xl border-[#FAF5EC] bg-[linear-gradient(140deg,#faf5ec,#f8f1e5_70%,#f4eee4)] p-4 shadow-none">
            <div className="flex items-center gap-2">
              <Gift className="size-4 text-[#5B132B]" />
              <span className="text-xs font-medium text-muted-foreground">Estimasi Seserahan</span>
            </div>
            <p className="mt-1 font-serif text-lg font-semibold text-[#5B132B]">
              {formatCurrency(report.totalSeserahanEstimated)}
            </p>
          </Card>
          <Card className="rounded-xl border-[#edf3e9] bg-[linear-gradient(140deg,#edf3e9,#f0f5ed_70%,#faf8f5)] p-4 shadow-none">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-[#527553]" />
              <span className="text-xs font-medium text-muted-foreground">Biaya Aktual Seserahan</span>
            </div>
            <p className="mt-1 font-serif text-lg font-semibold text-[#527553]">
              {formatCurrency(report.totalSeserahanActual)}
            </p>
          </Card>
          <Card className="rounded-xl border-[#fff4e5] bg-[linear-gradient(140deg,#fff4e5,#faf8f5_70%,#f5f0e8)] p-4 shadow-none">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-[#9b7922]" />
              <span className="text-xs font-medium text-muted-foreground">Pembayaran Vendor</span>
            </div>
            <p className="mt-1 font-serif text-lg font-semibold text-[#9b7922]">
              {formatCurrency(report.totalVendorPayments)}
            </p>
          </Card>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Biaya seserahan dan pembayaran vendor sudah termasuk dalam total pengeluaran dan mengurangi sisa anggaran.
        </p>
        <div className="mt-2 flex gap-4 text-xs">
          <Link
            href="/seserahan"
            className="inline-flex items-center gap-1.5 font-medium text-[#5B132B] hover:underline"
          >
            Lihat rincian seserahan <ArrowUpRight className="size-3" />
          </Link>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 font-medium text-[#9b7922] hover:underline"
          >
            Lihat rincian vendor <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </SectionCard>

      {/* Recent Expenses */}
      <SectionCard eyebrow="PENGELUARAN TERBARU" title="Riwayat Pengeluaran">
        {report.recentExpenses.length > 0 ? (
          <div className="mt-4 divide-y divide-border/60">
            {report.recentExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {exp.categoryName ?? "Tanpa kategori"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDateIndonesia(exp.expenseDate, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {exp.note && (
                      <>
                        <span className="size-1 rounded-full bg-current" />
                        <span className="truncate">{exp.note}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="ml-3 shrink-0 text-sm font-medium text-[#9b4a4a]">
                  -{formatCurrency(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            Belum ada pengeluaran.
          </p>
        )}
      </SectionCard>
    </>
  );
}
