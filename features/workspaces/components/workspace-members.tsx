"use client";

import { Mail, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/page-components";

import { inviteMemberAction, updateMemberRoleAction, removeMemberAction } from "@/features/workspaces/actions/member-actions";

interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  name: string | null;
  email: string | null;
}

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

export function WorkspaceMembersSection({
  workspaceId,
  currentUserId,
  members,
  canEdit,
}: {
  workspaceId: string;
  currentUserId: string;
  members: WorkspaceMember[];
  canEdit: boolean;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("FAMILY");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("email", inviteEmail);
      formData.append("role", inviteRole);
      await inviteMemberAction(formData);
      toast.success("Anggota berhasil diundang!");
      setInviteEmail("");
      setShowInvite(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengundang anggota");
    } finally {
      setIsInviting(false);
    }
  };

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
                    <form
                      action={async () => {
                        const fd = new FormData();
                        fd.append("memberId", member.id);
                        fd.append("role", (document.getElementById(`role-${member.id}`) as HTMLSelectElement)?.value || member.role);
                        await updateMemberRoleAction(fd);
                        toast.success("Role berhasil diperbarui");
                      }}
                    >
                      <select
                        id={`role-${member.id}`}
                        defaultValue={member.role}
                        className="h-7 rounded-lg border border-input bg-background px-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="PARTNER">Pasangan</option>
                        <option value="COORDINATOR">Koordinator</option>
                        <option value="FAMILY">Keluarga</option>
                      </select>
                    </form>
                  )}
                  {canEdit && !isCurrentUser && !isOwner && (
                    <form
                      action={async () => {
                        const fd = new FormData();
                        fd.append("memberId", member.id);
                        await removeMemberAction(fd);
                        toast.success(`${member.name} dihapus dari workspace`);
                      }}
                    >
                      <button
                        type="submit"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title={`Hapus "${member.name}" dari workspace`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="Belum ada anggota. Undang pasangan atau keluarga untuk berkolaborasi." icon={Users} />
      )}

      {canEdit && (
        <div className="mt-4">
          {!showInvite ? (
            <button
              onClick={() => setShowInvite(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 p-4 text-xs text-muted-foreground hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              <Mail className="size-4" />
              Undang anggota baru
            </button>
          ) : (
            <form onSubmit={handleInvite} className="rounded-lg border border-dashed border-border/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Undang Anggota Baru</p>
                <button
                  type="button"
                  onClick={() => { setShowInvite(false); setInviteEmail(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="text-xs">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Orang yang diundang harus sudah punya akun Sewaka.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role" className="text-xs">Peran</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="PARTNER">Pasangan</option>
                  <option value="COORDINATOR">Koordinator</option>
                  <option value="FAMILY">Keluarga</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="flex-1 h-8 text-xs bg-[#5B132B] hover:bg-[#4a1025] text-white"
                >
                  {isInviting ? "Mengundang..." : "Undang"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowInvite(false); setInviteEmail(""); }}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Card>
  );
}

