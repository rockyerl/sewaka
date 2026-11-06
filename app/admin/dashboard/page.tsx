import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAdminStats,
  listAdminUsers,
  listAdminWorkspaces,
  listAdminPlans,
  listAdminPayments,
  listAdminLogs,
} from "@/features/admin/actions/admin-actions";
import Link from "next/link";

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl font-medium tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const [stats, usersData, workspacesData, plans, paymentsData, logsData] = await Promise.all([
    getAdminStats(),
    listAdminUsers({ page: 1, limit: 5 }),
    listAdminWorkspaces({ page: 1, limit: 5 }),
    listAdminPlans(),
    listAdminPayments({ page: 1, limit: 5 }),
    listAdminLogs({ page: 1, limit: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitoring platform Sewaka.
        </p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Statistik platform">
        <StatCard label="Total Pengguna" value={String(stats.totalUsers)} detail="Akun terdaftar" />
        <StatCard label="Total Workspace" value={String(stats.totalWorkspaces)} detail="Pernikahan aktif" />
        <StatCard label="Langganan Aktif" value={String(stats.activeSubscriptions)} detail={`dari ${stats.totalSubscriptions} total`} />
        <StatCard label="Total Pendapatan" value={formatCurrency(stats.totalRevenue)} detail={`${stats.totalTransactions} transaksi`} />
      </section>

      {/* Navigation */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users" className="block rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-colors">
          <h3 className="font-medium">Manajemen Pengguna</h3>
          <p className="mt-1 text-xs text-muted-foreground">Lihat dan kelola semua pengguna</p>
        </Link>
        <Link href="/admin/workspaces" className="block rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-colors">
          <h3 className="font-medium">Manajemen Workspace</h3>
          <p className="mt-1 text-xs text-muted-foreground">Lihat dan kelola workspace</p>
        </Link>
        <Link href="/admin/plans" className="block rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-colors">
          <h3 className="font-medium">Paket Langganan</h3>
          <p className="mt-1 text-xs text-muted-foreground">Kelola subscription plans</p>
        </Link>
        <Link href="/admin/payments" className="block rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-colors">
          <h3 className="font-medium">Monitoring Pembayaran</h3>
          <p className="mt-1 text-xs text-muted-foreground">Lihat semua transaksi</p>
        </Link>
        <Link href="/admin/logs" className="block rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-colors">
          <h3 className="font-medium">System Logs</h3>
          <p className="mt-1 text-xs text-muted-foreground">Aktivitas sistem</p>
        </Link>
      </section>

      {/* Recent Users */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-medium">Pengguna Terbaru</h2>
        <div className="divide-y divide-border/60">
          {usersData.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{user.name ?? "Tanpa nama"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.emailVerified && (
                  <Badge variant="secondary" className="rounded-full bg-[#edf3e9] text-[#527553]">
                    Terverifikasi
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(user.createdAt, "d MMM yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Payments */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-medium">Transaksi Terbaru</h2>
        <div className="divide-y divide-border/60">
          {paymentsData.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{formatCurrency(Number(payment.amount))}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.gateway ?? "Manual"} • {payment.paidAt ? format(payment.paidAt, "d MMM yyyy") : "Belum dibayar"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`rounded-full ${
                  payment.status === "COMPLETED"
                    ? "bg-[#edf3e9] text-[#527553]"
                    : payment.status === "FAILED"
                    ? "bg-[#f4e9e9] text-[#9b4a4a]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {payment.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* System Logs */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-medium">Log Sistem Terbaru</h2>
        <div className="divide-y divide-border/60">
          {logsData.logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">
                  {log.entityType} • {log.actorId ? `oleh ${log.actorId.slice(0, 8)}...` : "Sistem"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(log.createdAt, "d MMM HH:mm")}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
