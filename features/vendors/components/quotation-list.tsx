import { Plus, Trash2, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { StatusBadge, quotationStatusPreset } from "@/components/ui/status-badge";
import { DateBadge } from "@/components/ui/date-badge";
import { formatCurrency } from "@/lib/utils/format-currency";

import {
  createQuotationAction,
  updateQuotationStatusAction,
  deleteQuotationAction,
  createVendorPaymentAction,
  deletePaymentAction,
} from "@/features/vendors/actions/quotation-actions";
import {
  listQuotationsByVendor,
  listPaymentsByVendor,
} from "@/features/vendors/hooks/quotation-queries";

export async function VendorQuotationSection({
  workspaceId,
  vendorId,
}: {
  workspaceId: string;
  vendorId: string;
}) {
  const quotations = await listQuotationsByVendor(vendorId);
  const canEdit = true;

  const totalQuoted = quotations
    .filter((q) => q.status === "ACCEPTED")
    .reduce((sum, q) => sum + parseFloat(q.amount), 0);

  return (
    <Card className="mb-4 gap-4 rounded-xl border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-[9px] font-semibold tracking-[0.14em] text-[#a08f74]">
            PENAWARAN VENDOR
          </p>
          <h3 className="font-serif text-sm font-medium tracking-tight">
            Penawaran & Pembayaran
          </h3>
        </div>
        {totalQuoted > 0 && (
          <Badge variant="secondary" className="rounded-full text-[10px] bg-[#edf3e9] text-[#527553]">
            Total: {formatCurrency(totalQuoted)}
          </Badge>
        )}
      </div>

      {quotations.length > 0 ? (
        <div className="divide-y divide-border/40">
          {quotations.map((q) => (
            <div key={q.id} className="flex items-center justify-between py-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-medium">
                    {q.quotationNumber || "Penawaran"}
                  </p>
                  <StatusBadge status={q.status} preset={quotationStatusPreset} />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(q.amount)}
                  </span>
                  {q.quotedDate && (
                    <DateBadge date={q.quotedDate} />
                  )}
                </div>
                {q.description && (
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {q.description}
                  </p>
                )}
              </div>
              {canEdit && q.status === "PENDING" && (
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <form action={updateQuotationStatusAction}>
                    <input type="hidden" name="quotationId" value={q.id} />
                    <input type="hidden" name="status" value="ACCEPTED" />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="size-7 p-0"
                    >
                      <Check className="size-3 text-[#527553]" />
                    </Button>
                  </form>
                  <form action={updateQuotationStatusAction}>
                    <input type="hidden" name="quotationId" value={q.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="size-7 p-0"
                    >
                      <X className="size-3 text-[#9b4a4a]" />
                    </Button>
                  </form>
                  <form action={deleteQuotationAction}>
                    <input type="hidden" name="quotationId" value={q.id} />
                    <ConfirmSubmitButton
                      confirmMessage="Hapus penawaran?"
                      aria-label="Hapus penawaran"
                      className="size-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {canEdit && (
        <form
          action={createQuotationAction}
          className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="vendorId" value={vendorId} />
          <label className="sr-only" htmlFor={`quotation-amount-${vendorId}`}>
            Jumlah
          </label>
          <input
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id={`quotation-amount-${vendorId}`}
            name="amount"
            placeholder="Jumlah penawaran"
            type="number"
            step="0.01"
            min="0"
            required
          />
          <label className="sr-only" htmlFor={`quotation-desc-${vendorId}`}>
            Deskripsi
          </label>
          <input
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id={`quotation-desc-${vendorId}`}
            name="description"
            placeholder="Deskripsi (opsional)"
            maxLength={500}
          />
          <Button type="submit" variant="outline" className="h-8 rounded-lg text-[10px]">
            <Plus className="size-3" /> Tambah
          </Button>
        </form>
      )}
    </Card>
  );
}

export async function VendorPaymentSection({
  workspaceId,
  vendorId,
}: {
  workspaceId: string;
  vendorId: string;
}) {
  const payments = await listPaymentsByVendor(vendorId);
  const canEdit = true;

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <Card className="mb-4 gap-4 rounded-xl border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-[9px] font-semibold tracking-[0.14em] text-[#a08f74]">
            PEMBAYARAN
          </p>
          <h3 className="font-serif text-sm font-medium tracking-tight">
            Riwayat Pembayaran
          </h3>
        </div>
        {totalPaid > 0 && (
          <Badge variant="secondary" className="rounded-full text-[10px] bg-[#edf3e9] text-[#527553]">
            Total: {formatCurrency(totalPaid)}
          </Badge>
        )}
      </div>

      {payments.length > 0 ? (
        <div className="divide-y divide-border/40">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-medium">
                    {p.paymentType || "Pembayaran"}
                  </p>
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px] bg-[#fff4e5] text-[#9b7922]"
                  >
                    {p.paymentType}
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(p.amount)}
                  </span>
                  <DateBadge date={p.paymentDate} />
                </div>
                {p.note && (
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {p.note}
                  </p>
                )}
              </div>
              {canEdit && (
                <form action={deletePaymentAction}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <ConfirmSubmitButton
                    confirmMessage="Hapus pembayaran?"
                    aria-label="Hapus pembayaran"
                    className="size-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {canEdit && (
        <form
          action={createVendorPaymentAction}
          className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="vendorId" value={vendorId} />
          <label className="sr-only" htmlFor={`payment-amount-${vendorId}`}>
            Jumlah
          </label>
          <input
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id={`payment-amount-${vendorId}`}
            name="amount"
            placeholder="Jumlah pembayaran"
            type="number"
            step="0.01"
            min="0"
            required
          />
          <label className="sr-only" htmlFor={`payment-type-${vendorId}`}>
            Tipe
          </label>
          <select
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id={`payment-type-${vendorId}`}
            name="paymentType"
          >
            <option value="DP">DP (Uang Muka)</option>
            <option value="Pelunasan">Pelunasan</option>
            <option value="Cicilan">Cicilan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
          <Button type="submit" variant="outline" className="h-8 rounded-lg text-[10px]">
            <Plus className="size-3" /> Tambah
          </Button>
        </form>
      )}
    </Card>
  );
}
