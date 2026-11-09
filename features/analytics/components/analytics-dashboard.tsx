"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Wallet,
  TrendingUp,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/page-components";

import {
  getRsvpStatsAction,
  getBudgetByCategoryAction,
  getAttendanceTrendsAction,
  getVendorComparisonAction,
  type RsvpStats,
  type BudgetCategoryData,
  type AttendanceData,
  type VendorData,
} from "../actions/analytics-actions";

interface AnalyticsDashboardProps {
  workspaceId: string;
}

export function AnalyticsDashboard({ workspaceId }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [rsvpStats, setRsvpStats] = useState<RsvpStats | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetCategoryData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [vendorData, setVendorData] = useState<VendorData[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [rsvp, budget, attendance, vendors] = await Promise.all([
          getRsvpStatsAction(workspaceId),
          getBudgetByCategoryAction(workspaceId),
          getAttendanceTrendsAction(workspaceId),
          getVendorComparisonAction(workspaceId),
        ]);
        setRsvpStats(rsvp);
        setBudgetData(budget);
        setAttendanceData(attendance);
        setVendorData(vendors);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-3 text-sm text-muted-foreground">Memuat analytics...</p>
        </div>
      </div>
    );
  }

  const totalBudget = budgetData.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = budgetData.reduce((sum, cat) => sum + cat.spent, 0);
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Insight lengkap tentang RSVP, anggaran, dan attendance tamu.
        </p>
      </div>

      {/* RSVP Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <Users className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">RSVP Status</h3>
            <p className="text-sm text-muted-foreground">
              {rsvpStats?.total ?? 0} tamu total
            </p>
          </div>
        </div>

        {rsvpStats && rsvpStats.total > 0 ? (
          <div className="space-y-4">
            {/* Coming */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span className="text-sm">Hadir</span>
                </div>
                <span className="text-sm font-medium">{rsvpStats.coming}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-green-600 transition-all"
                  style={{
                    width: `${(rsvpStats.coming / rsvpStats.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Not Coming */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-red-600" />
                  <span className="text-sm">Tidak Hadir</span>
                </div>
                <span className="text-sm font-medium">{rsvpStats.notComing}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-red-600 transition-all"
                  style={{
                    width: `${(rsvpStats.notComing / rsvpStats.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-yellow-600" />
                  <span className="text-sm">Belum Konfirmasi</span>
                </div>
                <span className="text-sm font-medium">{rsvpStats.pending}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-yellow-600 transition-all"
                  style={{
                    width: `${(rsvpStats.pending / rsvpStats.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((rsvpStats.coming / rsvpStats.total) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Konfirmasi Hadir</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {Math.round((rsvpStats.notComing / rsvpStats.total) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Tidak Hadir</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round((rsvpStats.pending / rsvpStats.total) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            message="Belum ada data RSVP. Data akan muncul saat Anda menambahkan tamu."
          />
        )}
      </Card>

      {/* Budget Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
            <Wallet className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">Anggaran vs Pengeluaran</h3>
            <p className="text-sm text-muted-foreground">
              Total budget: Rp {totalBudget.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {budgetData.length > 0 ? (
          <div className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Pengeluaran</span>
                <span className="text-sm text-muted-foreground">
                  Rp {totalSpent.toLocaleString("id-ID")} / Rp {totalBudget.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className={`h-3 rounded-full transition-all ${
                    budgetPercentage > 100
                      ? "bg-red-600"
                      : budgetPercentage > 80
                      ? "bg-yellow-600"
                      : "bg-green-600"
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {budgetPercentage.toFixed(1)}% dari total budget terpakai
              </p>
            </div>

            {/* Per Category */}
            <div className="space-y-3 pt-4 border-t">
              {budgetData.map((cat) => {
                const percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Rp {cat.spent.toLocaleString("id-ID")} / Rp {cat.budget.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage > 100
                            ? "bg-red-600"
                            : percentage > 80
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            message="Belum ada data anggaran. Data akan muncul saat Anda menambahkan kategori budget."
          />
        )}
      </Card>

      {/* Attendance Trends */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">Trend Check-in Tamu</h3>
            <p className="text-sm text-muted-foreground">
              7 hari terakhir
            </p>
          </div>
        </div>

        {attendanceData.length > 0 ? (
          <div className="space-y-3">
            {/* Simple Bar Chart */}
            <div className="flex items-end gap-2 h-40">
              {attendanceData.map((day) => {
                const maxCheckedIn = Math.max(
                  ...attendanceData.map((d) => d.checkedIn),
                  1
                );
                const heightPercentage = (day.checkedIn / maxCheckedIn) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">
                      {day.checkedIn}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-purple-600 transition-all"
                      style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Check-in</span>
                <span className="text-lg font-bold">
                  {attendanceData.reduce((sum, day) => sum + day.checkedIn, 0)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            message="Belum ada data check-in. Data akan muncul saat tamu mulai melakukan check-in."
          />
        )}
      </Card>

      {/* Vendor Comparison */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
            <Star className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">Rekomendasi Vendor</h3>
            <p className="text-sm text-muted-foreground">
              Vendor kurasi berdasarkan rating
            </p>
          </div>
        </div>

        {vendorData.length > 0 ? (
          <div className="space-y-3">
            {vendorData.slice(0, 5).map((vendor) => (
              <div
                key={vendor.name}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{vendor.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {vendor.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vendor.priceRange}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">{vendor.rating}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Star}
            message="Rekomendasi vendor akan muncul di sini."
          />
        )}
      </Card>
    </div>
  );
}
