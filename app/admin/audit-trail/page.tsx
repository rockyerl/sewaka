import { getAdminAuditLogs } from "@/features/admin/actions/admin-feature-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";

const actionColors = {
  create: "text-green-600 bg-green-50",
  update: "text-blue-600 bg-blue-50",
  delete: "text-red-600 bg-red-50",
  login: "text-purple-600 bg-purple-50",
  logout: "text-gray-600 bg-gray-50",
  export: "text-orange-600 bg-orange-50",
};

export default async function AuditTrailPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const params = await searchParams;
  const logs = await getAdminAuditLogs({
    page: Number(params.page) || 1,
    limit: 50,
    action: params.action || null,
    entityType: params.entity || null,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-muted-foreground">Log semua aksi admin di platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Aksi</CardTitle>
          <CardDescription>{logs.length} log ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Belum ada audit log.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className={`rounded-full px-2 py-1 text-xs font-medium ${actionColors[log.action as keyof typeof actionColors] || "text-gray-600 bg-gray-50"}`}>
                    {log.action.toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId && <span className="text-xs font-mono text-muted-foreground">{log.entityId.substring(0, 8)}...</span>}
                    </div>
                    {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
                    <p className="text-xs text-muted-foreground">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("id-ID") : "-"}
                    </p>
                  </div>
                  {log.ipAddress && (
                    <span className="text-xs font-mono text-muted-foreground">{log.ipAddress}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
