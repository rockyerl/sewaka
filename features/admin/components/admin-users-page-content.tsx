import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateText } from "@/components/ui/date-badge";
import { AdminPageHeader } from "@/components/shared/admin-components";
import { FormField } from "@/components/ui/form-field";
import { SubmitOutline } from "@/components/ui/submit-button";
import { PaginationBar } from "@/components/ui/pagination";
import { listAdminUsers, updateUserRole as updateUserRoleInternal } from "@/features/admin/actions/admin-actions";

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
        <FormField
          name="search-input"
          label=""
          icon={Search}
          placeholder="Cari nama atau email..."
          value=""
          onChange={() => {}}
          className="flex-1"
        />
        <SubmitOutline className="h-9 rounded-xl whitespace-nowrap">
          Cari
        </SubmitOutline>
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

        <PaginationBar
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={() => {}}
          totalItems={data.pagination.total}
        />
      </Card>
    </div>
  );
}
