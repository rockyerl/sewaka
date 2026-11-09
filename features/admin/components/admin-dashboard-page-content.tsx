import { StatusBadge, paymentStatusPreset } from "@/components/ui/status-badge";
import { DateText } from "@/components/ui/date-badge";
import { Card } from "@/components/ui/card";
import {
  AdminStatCard,
  AdminNavCard,
} from "@/components/shared/admin-components";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  getAdminStats,
  listAdminUsers,
  listAdminPayments,
  listAdminLogs,
} from "@/features/admin/actions/admin-actions";

export async function AdminDashboardPageContent() {
  const [stats, usersData, paymentsData, logsData] = await Promise.all([
    getAdminStats(),
    listAdminUsers({ page: 1, limit: 5 }),
    listAdminPayments({ page: 1, limit: 5 }),
    listAdminLogs({ page: 1, limit: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">Ringkasan Platform</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau operasional admin dan penggunaan fitur Sewaka.
        </p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Statistik platform">
        <AdminStatCard label="Total Pengguna" value={String(stats.totalUsers)} detail="Akun terdaftar" />
        <AdminStatCard label="Total Workspace" value={String(stats.totalWorkspaces)} detail="Pernikahan aktif" />
        <AdminStatCard label="Langganan Aktif" value={String(stats.activeSubscriptions)} detail={`dari ${stats.totalSubscriptions} total`} />
        <AdminStatCard label="Total Pendapatan" value={formatCurrency(stats.totalRevenue)} detail={`${stats.totalTransactions} transaksi`} />
      </section>

      <section className="space-y-4" aria-labelledby="product-usage-heading">
        <div>
          <h2 id="product-usage-heading" className="font-serif text-xl">Penggunaan fitur</h2>
          <p className="mt-1 text-sm text-muted-foreground">Total data yang dikelola pengguna di seluruh workspace.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Event" value={String(stats.productUsage.events)} detail="Jadwal acara pernikahan" />
          <AdminStatCard label="Task" value={String(stats.productUsage.tasks)} detail="Tugas dalam workflow" />
          <AdminStatCard label="Tamu" value={String(stats.productUsage.guests)} detail={`${stats.productUsage.checkedInGuests} sudah check-in`} />
          <AdminStatCard label="Check-in" value={String(stats.productUsage.checkInLogs)} detail="Catatan audit check-in" />
          <AdminStatCard label="Vendor" value={String(stats.productUsage.vendors)} detail="Vendor tersimpan di workspace" />
          <AdminStatCard label="Dokumen" value={String(stats.productUsage.documents)} detail="Berkas dan checklist nikah" />
          <AdminStatCard label="Kalender terhubung" value={String(stats.productUsage.connectedCalendars)} detail="Koneksi kalender aktif" />
          <AdminStatCard label="Tiket terbuka" value={String(stats.productUsage.openSupportTickets)} detail="Menunggu tindak lanjut support" />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="admin-shortcuts-heading">
        <div>
          <h2 id="admin-shortcuts-heading" className="font-serif text-xl">Operasional admin</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pintasan ke semua alat pengelolaan platform.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AdminNavCard href="/admin/users" title="Pengguna" description="Akun, verifikasi, dan peran admin" />
          <AdminNavCard href="/admin/workspaces" title="Workspace" description="Workspace, pasangan, dan jadwal" />
          <AdminNavCard href="/admin/plans" title="Paket langganan" description="Harga dan batas fitur paket" />
          <AdminNavCard href="/admin/payments" title="Pembayaran" description="Transaksi dan status pembayaran" />
          <AdminNavCard href="/admin/support" title="Support" description="Tiket dan tindak lanjut pengguna" />
          <AdminNavCard href="/admin/content" title="Konten" description="Konten publik dan pemasaran" />
          <AdminNavCard href="/admin/announcements" title="Pengumuman" description="Pesan untuk pengguna platform" />
          <AdminNavCard href="/admin/feature-flags" title="Feature flags" description="Kontrol ketersediaan fitur" />
          <AdminNavCard href="/admin/settings" title="Pengaturan sistem" description="Konfigurasi platform" />
          <AdminNavCard href="/admin/audit-trail" title="Audit trail" description="Riwayat aksi admin" />
          <AdminNavCard href="/admin/logs" title="Log sistem" description="Aktivitas dan catatan sistem" />
        </div>
      </section>

      {/* Recent Users */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-medium">Pengguna Terbaru</h2>
        <div className="divide-y divide-border/60">
          {usersData.users.length === 0 && <p className="py-4 text-sm text-muted-foreground">Belum ada pengguna.</p>}
          {usersData.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{user.name ?? "Tanpa nama"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.emailVerified && (
                  <StatusBadge status={true} preset={{ true: { label: "Terverifikasi", cls: "bg-[#edf3e9] text-[#527553]" } }} />
                )}
                <DateText date={user.createdAt} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Payments */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-medium">Transaksi Terbaru</h2>
        <div className="divide-y divide-border/60">
          {paymentsData.payments.length === 0 && <p className="py-4 text-sm text-muted-foreground">Belum ada transaksi.</p>}
          {paymentsData.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{formatCurrency(Number(payment.amount))}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.gateway ?? "Manual"} • {payment.paidAt ? <DateText date={payment.paidAt} /> : "Belum dibayar"}
                </p>
              </div>
              <StatusBadge status={payment.status} preset={paymentStatusPreset} />
            </div>
          ))}
        </div>
      </Card>

      {/* System Logs */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <h2 className="font-medium">Log Sistem Terbaru</h2>
        <div className="divide-y divide-border/60">
          {logsData.logs.length === 0 && <p className="py-4 text-sm text-muted-foreground">Belum ada aktivitas.</p>}
          {logsData.logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">
                  {log.entityType} • {log.actorId ? `oleh ${log.actorId.slice(0, 8)}...` : "Sistem"}
                </p>
              </div>
              <DateText date={log.createdAt} showTime />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
