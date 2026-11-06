import { ArrowUpRight, Download, Wallet } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SectionCard, StatCard } from "@/components/shared";
import { formatCurrency } from "@/lib/format-currency";

import { exportBudgetReport } from "@/features/budget/actions";
import { getFinancialReport } from "@/features/budget/queries";

export async function exportBudgetReportAction(formData: FormData) {
  "use server";
  const workspaceId = formData.get("workspaceId") as string;
  await exportBudgetReport(workspaceId);
}

async function FinancialPageContent({ workspaceId }: { workspaceId: string }) {
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
      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Statistik keuangan">
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
        />
        <StatCard
          label="Pembayaran Vendor"
          value={formatCurrency(report.totalVendorPayments)}
          icon={Wallet}
          iconClass="bg-[#fff4e5] text-[#9b7922]"
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
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(exp.expenseDate)}
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

export const instant = false;

export default async function FinancialPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  return <FinancialPageContent workspaceId={workspace.id} />;
}
