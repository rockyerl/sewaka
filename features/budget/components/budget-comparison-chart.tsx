"use client";

import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BudgetComparisonData {
  categories: {
    categoryId: string;
    categoryName: string;
    allocated: number;
    actual: number;
    remaining: number;
    percentage: number;
    overBudget: boolean;
    overBudgetAmount: number;
  }[];
  totals: {
    allocated: number;
    actual: number;
    remaining: number;
    percentage: number;
    overBudget: boolean;
    overBudgetAmount: number;
  };
}

interface BudgetComparisonChartProps {
  data: BudgetComparisonData;
}

export function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totals.allocated)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            {data.totals.overBudget ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totals.overBudget ? "text-destructive" : ""}`}>
              {formatCurrency(data.totals.actual)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totals.percentage.toFixed(1)}% dari anggaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Anggaran</CardTitle>
            {data.totals.remaining < 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totals.remaining < 0 ? "text-destructive" : ""}`}>
              {formatCurrency(data.totals.remaining)}
            </div>
            {data.totals.overBudget && (
              <p className="text-xs text-destructive">
                Melebihi {formatCurrency(data.totals.overBudgetAmount)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Anggaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Penggunaan</span>
              <span className="font-medium">{data.totals.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  data.totals.percentage > 90
                    ? "bg-destructive"
                    : data.totals.percentage > 70
                    ? "bg-warning"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(data.totals.percentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.categories.map((category) => (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.categoryName}</span>
                    {category.overBudget && (
                      <Badge variant="destructive" className="text-xs">
                        Melebihi
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${
                      category.overBudget ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatCurrency(category.actual)} / {formatCurrency(category.allocated)}
                  </span>
                  <span>
                    {category.remaining >= 0
                      ? `Sisa ${formatCurrency(category.remaining)}`
                      : `Melebihi ${formatCurrency(category.overBudgetAmount)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
