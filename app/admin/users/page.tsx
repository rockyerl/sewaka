import { format } from "date-fns";
import { updateUserRole as updateUserRoleInternal } from "@/features/admin/actions/admin-actions";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAdminUsers } from "@/features/admin/actions/admin-actions";

export async function setRoleAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as "user" | "admin";
  await updateUserRoleInternal(userId, newRole);
}

async function SetRoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  return (
    <form action={setRoleAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="newRole" value={currentRole === "admin" ? "user" : "admin"} />
      <button
        type="submit"
        className="h-6 rounded border border-border px-2 text-[10px] hover:bg-muted"
      >
        {currentRole === "admin" ? "Hapus Admin" : "Buat Admin"}
      </button>
    </form>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const search = typeof resolved === "object" && resolved !== null ? (resolved as { search?: string }).search : undefined;
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  const data = await listAdminUsers({ search, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight">Manajemen Pengguna</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lihat dan kelola semua pengguna platform.</p>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari nama atau email..."
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground">
          Cari
        </button>
      </form>

      {/* Users List */}
      <Card className="gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
        <div className="divide-y divide-border/60">
          {data.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{user.name ?? "Tanpa nama"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Badge className="rounded-full bg-[#5B132B] text-white">Admin</Badge>
                )}
                {user.emailVerified && (
                  <Badge variant="secondary" className="rounded-full bg-[#edf3e9] text-[#527553]">
                    Terverifikasi
                  </Badge>
                )}
                <SetRoleForm userId={user.id} currentRole={user.role ?? "user"} />
                <span className="text-xs text-muted-foreground">
                  {format(user.createdAt, "d MMM yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Halaman {data.pagination.page} dari {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              {data.pagination.page > 1 && (
                <a href={`/admin/users?page=${data.pagination.page - 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
                  Sebelumnya
                </a>
              )}
              {data.pagination.page < data.pagination.totalPages && (
                <a href={`/admin/users?page=${data.pagination.page + 1}`} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
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
