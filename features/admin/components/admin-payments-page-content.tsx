import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge, paymentStatusPreset } from "@/components/ui/status-badge";
import { DateText } from "@/components/ui/date-badge";
import { AdminPageHeader } from "@/components/shared/admin-components";
import { formatCurrency } from "@/lib/utils/format-currency";
import { listAdminPayments } from "@/features/admin/actions/admin-actions";

export async function AdminPaymentsPageContent({
  status,
  page,
}: {
  status?: string;
  page: number;
}) {
  const data = await listAdminPayments({ status, page });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Monitoring Pembayaran" description="Lihat semua transaksi pembayaran." />

      {/* Filter */}
      <form className="flex gap-2">
        <label className="sr-only" htmlFor="payment-status">Filter status pembayaran</label>
        <select id="payment-status" name="status" defaultValue={status ?? ""} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
          <option value="">Semua status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button type="submit" className="h-10 rounded-xl border border-input px-4 text-sm font-medium hover:bg-muted">Filter</button>
      </form>

      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <div className="divide-y divide-border/60">
          {data.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{formatCurrency(Number(payment.amount))}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.gateway ?? "Manual"} • {payment.paidAt ? <DateText date={payment.paidAt} showTime /> : "Belum dibayar"}
                </p>
              </div>
              <StatusBadge status={payment.status} preset={paymentStatusPreset} />
            </div>
          ))}
        </div>

        {data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">Halaman {data.pagination.page} dari {data.pagination.totalPages}</p>
            <div className="flex gap-2">
              {data.pagination.page > 1 && <Link className="rounded-lg border px-3 py-1 text-xs hover:bg-muted" href={`/admin/payments?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.pagination.page - 1) })}`}>Sebelumnya</Link>}
              {data.pagination.page < data.pagination.totalPages && <Link className="rounded-lg border px-3 py-1 text-xs hover:bg-muted" href={`/admin/payments?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.pagination.page + 1) })}`}>Selanjutnya</Link>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
