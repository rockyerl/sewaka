import { Card } from "@/components/ui/card";
import { DateText } from "@/components/ui/date-badge";
import { AdminPagination, AdminPageHeader } from "@/components/shared/admin-components";
import { listAdminLogs } from "@/features/admin/actions/admin-actions";

export async function AdminLogsPageContent({ page }: { page: number }) {
  const data = await listAdminLogs({ page });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="System Logs" description="Aktivitas sistem terbaru." />

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
              <DateText date={log.createdAt} showTime />
            </div>
          ))}
        </div>

        <AdminPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          baseUrl="/admin/logs"
        />
      </Card>
    </div>
  );
}
