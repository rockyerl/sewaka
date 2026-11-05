import { Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { listWorkspaceMembers } from "@/features/workspaces/queries";
import {
  updateMemberRoleAction,
  removeMemberAction,
} from "@/features/workspaces/actions";

function roleBadge(role: string) {
  const map: Record<string, { label: string; cls: string }> = {
    OWNER: { label: "Pemilik", cls: "bg-[#f5efd9] text-[#9b7922]" },
    PARTNER: { label: "Pasangan", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
    COORDINATOR: { label: "Koordinator", cls: "bg-[#edf3e9] text-[#527553]" },
    FAMILY: { label: "Keluarga", cls: "bg-muted text-muted-foreground" },
  };
  const entry = map[role] ?? map.FAMILY;
  return (
    <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>
      {entry.label}
    </Badge>
  );
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function WorkspaceMembersSection({
  workspaceId,
  currentUserId,
}: {
  workspaceId: string;
  currentUserId: string;
}) {
  const members = await listWorkspaceMembers();
  const canEdit = true;

  return (
    <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            ANGGOTA WORKSPACE
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">
            Tim Persiapan
          </h2>
        </div>
        <Badge variant="secondary" className="rounded-full text-[10px]">
          {members.length} anggota
        </Badge>
      </div>

      {members.length > 0 ? (
        <div className="mt-4 divide-y divide-border/60">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const isOwner = member.role === "OWNER";

            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-xs font-semibold text-primary">
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {member.name || "Tanpa nama"}
                      </p>
                      {roleBadge(member.role)}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {canEdit && !isOwner && (
                    <form action={updateMemberRoleAction}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <select
                        name="role"
                        className="h-7 rounded-lg border border-input bg-background px-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue={member.role}
                      >
                        <option value="PARTNER">Pasangan</option>
                        <option value="COORDINATOR">Koordinator</option>
                        <option value="FAMILY">Keluarga</option>
                      </select>
                    </form>
                  )}
                  {canEdit && !isCurrentUser && !isOwner && (
                    <form action={removeMemberAction}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Hapus "${member.name}" dari workspace?`}
                        aria-label="Hapus anggota"
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-muted/60 p-6 text-center">
          <Users className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada anggota. Undang pasangan atau keluarga untuk berkolaborasi.
          </p>
        </div>
      )}

      {canEdit && (
        <div className="mt-4 rounded-lg border border-dashed border-border/60 p-4 text-center">
          <Users className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">
            Untuk mengundang anggota baru, mereka harus memiliki akun Sewaka.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bagikan link undangan workspace ke pasangan atau keluarga.
          </p>
        </div>
      )}
    </Card>
  );
}
