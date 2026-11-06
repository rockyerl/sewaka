import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AdminStatCard,
  AdminNavCard,
} from "@/components/shared/admin-components";
import { formatCurrency } from "@/lib/format-currency";
import {
  getAdminStats,
  listAdminUsers,
  listAdminPayments,
  listAdminLogs,
} from "@/features/admin/actions/admin-actions";

export default async function AdminDashboardPage() {
  const [stats, usersData, paymentsData, logsData] = await Promise.all([
    getAdminStats(),
    listAdminUsers({ page: 1, limit: 5 }),
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
        <AdminStatCard label="Total Pengguna" value={String(stats.totalUsers)} detail="Akun terdaftar" />
        <AdminStatCard label="Total Workspace" value={String(stats.totalWorkspaces)} detail="Pernikahan aktif" />
        <AdminStatCard label="Langganan Aktif" value={String(stats.activeSubscriptions)} detail={`dari ${stats.totalSubscriptions} total`} />
        <AdminStatCard label="Total Pendapatan" value={formatCurrency(stats.totalRevenue)} detail={`${stats.totalTransactions} transaksi`} />
      </section>

      {/* Navigation */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminNavCard href="/admin/users" title="Manajemen Pengguna" description="Lihat dan kelola semua pengguna" />
        <AdminNavCard href="/admin/workspaces" title="Manajemen Workspace" description="Lihat dan kelola workspace" />
        <AdminNavCard href="/admin/plans" title="Paket Langganan" description="Kelola subscription plans" />
        <AdminNavCard href="/admin/payments" title="Monitoring Pembayaran" description="Lihat semua transaksi" />
        <AdminNavCard href="/admin/logs" title="System Logs" description="Aktivitas sistem" />
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
