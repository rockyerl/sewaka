"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smartphone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/page-components";
import { showToast } from "@/components/ui/toast";

import {
  getCheckInLogsAction,
  exportCheckInLogsAction,
  type CheckInLogEntry,
} from "../actions/check-in-logs-action";

interface CheckInLogsViewProps {
  workspaceId: string;
}

const SYNC_STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  SYNCED: { label: "Synced", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
};

const ACTION_BADGE: Record<string, { label: string; icon: typeof CheckCircle2 }> = {
  CHECK_IN: { label: "Check-in", icon: CheckCircle2 },
  CHECK_OUT: { label: "Check-out", icon: XCircle },
  MANUAL_CHECK_IN: { label: "Manual Check-in", icon: User },
  OFFLINE_CHECK_IN: { label: "Offline Check-in", icon: Smartphone },
};

export function CheckInLogsView({ workspaceId }: CheckInLogsViewProps) {
  const [logs, setLogs] = useState<CheckInLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [syncStatus, setSyncStatus] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ignore = false;
    getCheckInLogsAction(workspaceId, {
      page,
      pageSize: 20,
      search: search || undefined,
      syncStatus: syncStatus === "ALL" ? undefined : syncStatus,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((result) => {
        if (!ignore) {
          setLogs(result.logs);
          setTotal(result.total);
          setHasMore(result.hasMore);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch check-in logs:", error);
          showToast("Gagal memuat audit logs");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [workspaceId, page, search, syncStatus, dateFrom, dateTo]);

  const handleSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 500);
    setSearchTimeout(timeout);
  };

  const handleExport = async () => {
    try {
      const csvContent = await exportCheckInLogsAction(workspaceId);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `check-in-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Audit logs berhasil di-export");
    } catch (error) {
      console.error("Failed to export logs:", error);
      showToast("Gagal export audit logs");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSyncStatus("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSyncBadge = (status: string | null) => {
    const config = SYNC_STATUS_BADGE[status || "PENDING"];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const config = ACTION_BADGE[action] || { label: action, icon: CheckCircle2 };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Icon className="size-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Audit Logs Check-in</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor semua aktivitas check-in tamu, termasuk sync status dari offline queue.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama tamu..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sync Status Filter */}
          <Select value={syncStatus} onValueChange={(value) => { setSyncStatus(value); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Status Sync" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SYNCED">Synced</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From */}
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full sm:w-[180px]"
          />

          {/* Date To */}
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-full sm:w-[180px]"
          />

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="whitespace-nowrap"
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Logs</p>
              <p className="text-lg font-semibold">{total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Synced</p>
              <p className="text-lg font-semibold">
                {logs.filter((l) => l.syncStatus === "SYNCED").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">
                {logs.filter((l) => l.syncStatus === "PENDING").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-lg font-semibold">
                {logs.filter((l) => l.syncStatus === "FAILED").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-3 text-sm text-muted-foreground">Memuat audit logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Clock}
            message="Belum ada audit logs. Audit logs akan muncul saat ada tamu melakukan check-in."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Tamu</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Dilakukan Oleh</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Waktu Check-in</TableHead>
                    <TableHead>Status Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.guestName || "-"}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.performedBy || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.deviceInfo ? (
                          <div className="flex items-center gap-1">
                            <Smartphone className="size-3" />
                            {log.deviceInfo}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(log.checkedInAt)}
                      </TableCell>
                      <TableCell>{getSyncBadge(log.syncStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {Math.ceil(total / 20)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="gap-1"
                >
                  Selanjutnya
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
