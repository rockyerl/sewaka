import { CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";

import { getSubscriptionHistory } from "@/features/subscription/queries/subscription-history-queries";

function formatCurrencyWithCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    ACTIVE: { label: "Aktif", cls: "bg-[#edf3e9] text-[#527553]", icon: CheckCircle2 },
    PAST_DUE: { label: "Terlambat", cls: "bg-[#fff4e5] text-[#9b7922]", icon: Clock },
    EXPIRED: { label: "Kadaluarsa", cls: "bg-muted text-muted-foreground", icon: Clock },
    CANCELLED: { label: "Dibatalkan", cls: "bg-[#f4e9e9] text-[#9b4a4a]", icon: XCircle },
    REFUNDED: { label: "Dikembalikan", cls: "bg-muted text-muted-foreground", icon: XCircle },
  };
  const entry = map[status] ?? map.EXPIRED;
  const Icon = entry.icon;
  return (
    <Badge variant="secondary" className={`rounded-full gap-1 ${entry.cls}`}>
      <Icon className="size-3" /> {entry.label}
    </Badge>
  );
}

function paymentStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    COMPLETED: { label: "Lunas", cls: "bg-[#edf3e9] text-[#527553]" },
    PENDING: { label: "Menunggu", cls: "bg-[#fff4e5] text-[#9b7922]" },
    FAILED: { label: "Gagal", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
    REFUNDED: { label: "Dikembalikan", cls: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] ?? map.PENDING;
  return <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>{entry.label}</Badge>;
}

async function SubscriptionHistoryPageContent({ workspaceId }: { workspaceId: string }) {
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
                    {statusBadge(entry.status)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mulai{" "}
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(entry.startedAt)}
                    {entry.expiresAt && (
                      <>
                        {" "}
                        • Berakhir{" "}
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(entry.expiresAt)}
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
                            {paymentStatusBadge(tx.status)}
                            {tx.gateway && (
                              <span className="text-xs text-muted-foreground">via {tx.gateway}</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {tx.paidAt
                              ? new Intl.DateTimeFormat("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(tx.paidAt)
                              : "Belum dibayar"}
                          </p>
                        </div>
                        <span className="ml-3 shrink-0 text-sm font-medium">
                          {formatCurrencyWithCurrency(tx.amount, tx.currency)}
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
        <Card className="gap-4 rounded-xl border-border/80 bg-card p-8 text-center shadow-sm">
          <CreditCard className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="font-serif text-lg font-medium">Belum Ada Riwayat</h3>
          <p className="text-sm text-muted-foreground">
            Riwayat langganan dan pembayaran akan muncul di sini.
          </p>
        </Card>
      )}
    </>
  );
}

export const instant = false;

export default async function SubscriptionHistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  return <SubscriptionHistoryPageContent workspaceId={workspace.id} />;
}
