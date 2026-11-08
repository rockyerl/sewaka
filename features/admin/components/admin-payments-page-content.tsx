import { Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge, paymentStatusPreset } from "@/components/ui/status-badge";
import { DateText } from "@/components/ui/date-badge";
import { AdminPageHeader } from "@/components/shared/admin-components";
import { formatCurrency } from "@/lib/utils/format-currency";
import { FormSelect } from "@/components/ui/form-field";
import { SubmitOutline } from "@/components/ui/submit-button";
import { PaginationBar } from "@/components/ui/pagination";
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
        <FormSelect
          name="status-select"
          label=""
          icon={Filter}
          placeholder="Semua status"
          value=""
          onChange={() => {}}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "COMPLETED", label: "Completed" },
            { value: "FAILED", label: "Failed" },
            { value: "REFUNDED", label: "Refunded" },
          ]}
        />
        <SubmitOutline className="h-9 rounded-xl whitespace-nowrap">
          Filter
        </SubmitOutline>
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

        <PaginationBar
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={() => {}}
          totalItems={data.pagination.total}
        />
      </Card>
    </div>
  );
}
