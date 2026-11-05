import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAdminPayments } from "@/features/admin/actions/admin-actions";

export const instant = false;

function formatCurrency(amount: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const status = typeof resolved === "object" && resolved !== null ? (resolved as { status?: string }).status : undefined;
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  const data = await listAdminPayments({ status, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">Monitoring Pembayaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lihat semua transaksi pembayaran.</p>
      </div>

      {/* Filter */}
      <form className="flex gap-2">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Semua status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground">
          Filter
        </button>
      </form>

      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <div className="divide-y divide-border/60">
          {data.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.gateway ?? "Manual"} • {payment.paidAt ? format(payment.paidAt, "d MMM yyyy HH:mm") : "Belum dibayar"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`rounded-full ${
                  payment.status === "COMPLETED"
                    ? "bg-[#edf3e9] text-[#527553]"
                    : payment.status === "FAILED"
                    ? "bg-[#f4e9e9] text-[#9b4a4a]"
                    : payment.status === "REFUNDED"
                    ? "bg-[#e9f0f5] text-[#4a7a9b]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {payment.status}
              </Badge>
            </div>
          ))}
        </div>

        {data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Halaman {data.pagination.page} dari {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              {data.pagination.page > 1 && (
                <a href={`/admin/payments?page=${data.pagination.page - 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
                  Sebelumnya
                </a>
              )}
              {data.pagination.page < data.pagination.totalPages && (
                <a href={`/admin/payments?page=${data.pagination.page + 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
                  Selanjutnya
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
