import { Clock, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { listActivityLogs } from "@/features/dashboard/hooks/activity-queries";

const actionLabels: Record<string, string> = {
  CREATE: "Membuat",
  UPDATE: "Mengubah",
  DELETE: "Menghapus",
  COMPLETE: "Menyelesaikan",
  ASSIGN: "Menugaskan",
  PAY: "Membayar",
  QUOTE: "Menawarkan",
};

const entityLabels: Record<string, string> = {
  task: "Tugas",
  budget: "Anggaran",
  expense: "Pengeluaran",
  vendor: "Vendor",
  guest: "Tamu",
  event: "Acara",
  quotation: "Penawaran",
  payment: "Pembayaran",
  document: "Dokumen",
};

function getActionIcon(action: string) {
  switch (action) {
    case "CREATE":
      return <FileText className="h-3.5 w-3.5 text-green-600" />;
    case "UPDATE":
      return <FileText className="h-3.5 w-3.5 text-blue-600" />;
    case "DELETE":
      return <FileText className="h-3.5 w-3.5 text-red-600" />;
    case "COMPLETE":
      return <FileText className="h-3.5 w-3.5 text-emerald-600" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export async function ActivityLogSection() {
  const logs = await listActivityLogs(20);

  if (logs.length === 0) {
    return (
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-primary">
          Riwayat Aktivitas
        </h2>
        <EmptyState message="Belum ada aktivitas yang tercatat." icon={Clock} />
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold text-primary">
        Riwayat Aktivitas
      </h2>
      <div className="space-y-3">
        {logs.map((log) => (
          <Card
            key={log.id}
            className="rounded-xl border-border/60 bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {getActionIcon(log.action)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {log.actorName ?? "Sistem"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {actionLabels[log.action] ?? log.action.toLowerCase()}{" "}
                    {entityLabels[log.entityType] ?? log.entityType}
                  </span>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-[#eee5d9] px-2 text-[10px] text-primary"
                  >
                    {log.entityType}
                  </Badge>
                </div>
                <time className="mt-1 block text-[11px] text-muted-foreground">
                  {formatDateIndonesia(log.createdAt, {
                    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </time>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
