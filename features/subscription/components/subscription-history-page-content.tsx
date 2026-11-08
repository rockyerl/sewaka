import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge, subscriptionStatusPreset, paymentStatusPreset } from "@/components/ui/status-badge";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { PageHeader, EmptyState } from "@/components/shared/page-components";
import { formatCurrency } from "@/lib/utils/format-currency";

import { getSubscriptionHistory } from "@/features/subscription/hooks/subscription-history-queries";

export async function SubscriptionHistoryPageContent({ workspaceId }: { workspaceId: string }) {
  const history = await getSubscriptionHistory(workspaceId);

  return (
    <>
      <PageHeader
        eyebrow="LANGGANAN"
        title="Riwayat Langganan"
        description="Lihat riwayat langganan dan pembayaran workspace kamu."
      />

      {history.length > 0 ? (
        <div className="space-y-6">
          {history.map((entry) => (
            <Card
              key={entry.subscriptionId}
              className="gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-medium">{entry.planName}</h2>
                    <StatusBadge status={entry.status} preset={subscriptionStatusPreset} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mulai{" "}
                    {formatDateIndonesia(entry.startedAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {entry.expiresAt && (
                      <>
                        {" "}
                        • Berakhir{" "}
                        {formatDateIndonesia(entry.expiresAt, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              {entry.transactions.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CreditCard className="size-4" /> Pembayaran
                  </h3>
                  <div className="divide-y divide-border/40 rounded-lg border border-border/60">
                    {entry.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={tx.status} preset={paymentStatusPreset} />
                            {tx.gateway && (
                              <span className="text-xs text-muted-foreground">via {tx.gateway}</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {tx.paidAt
                              ? formatDateIndonesia(tx.paidAt, {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Belum dibayar"}
                          </p>
                        </div>
                        <span className="ml-3 shrink-0 text-sm font-medium">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message="Belum ada riwayat. Riwayat langganan dan pembayaran akan muncul di sini." icon={CreditCard} />
      )}
    </>
  );
}
