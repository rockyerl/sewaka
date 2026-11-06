import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { listAdminLogs } from "@/features/admin/actions/admin-actions";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  const data = await listAdminLogs({ page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">System Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Aktivitas sistem terbaru.</p>
      </div>

      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <div className="divide-y divide-border/60">
          {data.logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                •
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}...` : ""}
                  {log.actorId ? ` • oleh ${log.actorId.slice(0, 8)}...` : " • Sistem"}
                </p>
                {(log.metadata as any) && (
                  <pre className="mt-1 max-h-20 overflow-auto rounded bg-muted/50 p-2 text-[10px] text-muted-foreground">
                    {JSON.stringify(log.metadata as any, null, 2)}
                  </pre>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {format(log.createdAt, "d MMM HH:mm")}
              </span>
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
                <a href={`/admin/logs?page=${data.pagination.page - 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
                  Sebelumnya
                </a>
              )}
              {data.pagination.page < data.pagination.totalPages && (
                <a href={`/admin/logs?page=${data.pagination.page + 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
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
