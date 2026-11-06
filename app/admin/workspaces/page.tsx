import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAdminWorkspaces } from "@/features/admin/actions/admin-actions";

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const search = typeof resolved === "object" && resolved !== null ? (resolved as { search?: string }).search : undefined;
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  const data = await listAdminWorkspaces({ search, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">Manajemen Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lihat semua workspace pernikahan.</p>
      </div>

      <form className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari nama pasangan..."
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground">
          Cari
        </button>
      </form>

      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <div className="divide-y divide-border/60">
          {data.workspaces.map((ws) => (
            <div key={ws.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">
                  {[ws.coupleOne, ws.coupleTwo].filter(Boolean).join(" & ") || ws.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ws.location || "Lokasi belum ditentukan"}
                  {ws.weddingDate ? ` • ${format(ws.weddingDate, "d MMM yyyy")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full bg-[#f5efd9] text-[#9b7922]">
                  {ws.culturalTradition}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(ws.createdAt, "d MMM yyyy")}
                </span>
              </div>
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
                <a href={`/admin/workspaces?page=${data.pagination.page - 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
                  Sebelumnya
                </a>
              )}
              {data.pagination.page < data.pagination.totalPages && (
                <a href={`/admin/workspaces?page=${data.pagination.page + 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
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
