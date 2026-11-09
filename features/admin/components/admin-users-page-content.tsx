import { Search } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateText } from "@/components/ui/date-badge";
import { AdminPageHeader } from "@/components/shared/admin-components";
import { listAdminUsers, updateUserRole as updateUserRoleInternal } from "@/features/admin/actions/admin-actions";

export async function setRoleAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as "user" | "admin";
  await updateUserRoleInternal(userId, newRole);
  revalidatePath("/admin/users");
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

export async function AdminUsersPageContent({
  search,
  page,
}: {
  search?: string;
  page: number;
}) {
  const data = await listAdminUsers({ search, page });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Manajemen Pengguna" description="Lihat dan kelola semua pengguna platform." />

      {/* Search */}
      <form className="flex gap-2">
        <label className="sr-only" htmlFor="user-search">Cari pengguna</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="user-search"
            name="search"
            defaultValue={search}
            placeholder="Cari nama atau email..."
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button type="submit" className="h-10 rounded-xl border border-input px-4 text-sm font-medium hover:bg-muted">Cari</button>
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
                <DateText date={user.createdAt} />
              </div>
            </div>
          ))}
        </div>

        {data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">Halaman {data.pagination.page} dari {data.pagination.totalPages}</p>
            <div className="flex gap-2">
              {data.pagination.page > 1 && <Link className="rounded-lg border px-3 py-1 text-xs hover:bg-muted" href={`/admin/users?${new URLSearchParams({ ...(search ? { search } : {}), page: String(data.pagination.page - 1) })}`}>Sebelumnya</Link>}
              {data.pagination.page < data.pagination.totalPages && <Link className="rounded-lg border px-3 py-1 text-xs hover:bg-muted" href={`/admin/users?${new URLSearchParams({ ...(search ? { search } : {}), page: String(data.pagination.page + 1) })}`}>Selanjutnya</Link>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
