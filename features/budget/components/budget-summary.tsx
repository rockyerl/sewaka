import type { BudgetOverview } from "../queries";

function formatCurrency(value: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function BudgetSummary({ budget }: { budget: BudgetOverview }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-muted/60 p-3">
        <p className="text-xs text-muted-foreground">Batas anggaran</p>
        <p className="mt-1 font-serif text-lg font-medium">
          {formatCurrency(budget.totalAmount)}
        </p>
      </div>
      <div className="rounded-lg bg-muted/60 p-3">
        <p className="text-xs text-muted-foreground">Sisa anggaran</p>
        <p
          className={`mt-1 font-serif text-lg font-medium ${
            Number(budget.remainingAmount) < 0 ? "text-destructive" : ""
          }`}
        >
          {formatCurrency(budget.remainingAmount)}
        </p>
      </div>
    </div>
  );
}
