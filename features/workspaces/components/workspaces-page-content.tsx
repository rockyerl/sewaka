import Link from "next/link";
import { Heart, MapPin, CalendarDays, Shield, Crown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { formatCurrency } from "@/lib/utils/format-currency";

import { listWorkspaceMembers } from "@/features/workspaces/hooks/member-queries";
import { WorkspaceMembersSection } from "@/features/workspaces/components/workspace-members";

export async function WorkspacesPageContent({
  workspaces,
  currentWorkspaceId,
  currentUserId,
}: {
  workspaces: Array<{
    id: string;
    name: string;
    coupleOne: string | null;
    coupleTwo: string | null;
    weddingDate: Date | null;
    location: string | null;
    totalBudget: string | null;
    role: string;
  }>;
  currentWorkspaceId: string;
  currentUserId: string;
}) {
  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      OWNER: { label: "Pemilik", cls: "bg-[#f5efd9] text-[#9b7922]" },
      PARTNER: { label: "Pasangan", cls: "bg-[#f4e9e9] text-[#9b4a4a]" },
      COORDINATOR: { label: "Koordinator", cls: "bg-[#edf3e9] text-[#527553]" },
      FAMILY: { label: "Keluarga", cls: "bg-muted text-muted-foreground" },
    };
    const entry = map[role] ?? map.FAMILY;
    return <Badge variant="secondary" className={`rounded-full text-[10px] ${entry.cls}`}>{entry.label}</Badge>;
  };

  const formatBudget = (value: string | null) => {
    if (!value || Number(value) === 0) return "Belum diatur";
    return formatCurrency(Number(value));
  };

  const members = currentWorkspaceId ? await listWorkspaceMembers() : [];

  return (
    <>
      {/* Settings Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <Shield className="size-3.5" />
          <span>Akun Saya</span>
        </Link>
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5B132B] px-4 py-2 text-xs font-semibold text-[#D4AF37] shadow-xs"
        >
          <Heart className="size-3.5" />
          <span>Workspace & Tim</span>
        </Link>
        <Link
          href="/subscription"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
        >
          <Crown className="size-3.5" />
          <span>Paket Langganan</span>
        </Link>
      </div>

      <PageHeader
        eyebrow="PENGATURAN"
        title="Workspace Pernikahan"
        description="Kelola workspace pernikahan dan pengaturan kolaborasi."
      />

      {/* Workspaces List */}
      <SectionCard eyebrow="WORKSPACE KAMU" title="Daftar Workspace">
        {workspaces.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {workspaces.map((ws) => {
              const coupleNames = [ws.coupleOne, ws.coupleTwo].filter(Boolean);
              const weddingName = coupleNames.length ? coupleNames.join(" & ") : ws.name;
              const isActive = ws.id === currentWorkspaceId;

              return (
                <a
                  key={ws.id}
                  href={`/dashboard?workspaceId=${encodeURIComponent(ws.id)}`}
                  className={`group block rounded-xl border p-5 transition-colors ${
                    isActive
                      ? "border-primary bg-[#faf6f0]"
                      : "border-border/60 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1e7d8] font-serif text-sm font-semibold text-primary">
                        {coupleNames.length
                          ? coupleNames.map((name) => name?.charAt(0)).join("&")
                          : ws.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{ws.name}</p>
                        <p className="text-xs text-muted-foreground">{weddingName}</p>
                      </div>
                    </div>
                    {isActive && (
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-[#edf3e9] text-[10px] text-[#527553]"
                      >
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {ws.weddingDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {formatDateIndonesia(ws.weddingDate, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {ws.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        <span className="truncate">{ws.location}</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {roleBadge(ws.role)}
                    <span className="text-xs text-muted-foreground">
                      {formatBudget(ws.totalBudget)}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : null}
      </SectionCard>

      {/* Workspace Members */}
      {currentWorkspaceId && (
        <WorkspaceMembersSection
          workspaceId={currentWorkspaceId}
          currentUserId={currentUserId}
          members={members}
          canEdit={true}
        />
      )}

      {/* Info Card */}
      <Card className="gap-5 rounded-xl border-[#eee4d6] bg-[linear-gradient(140deg,#f8f1e5,#f4eee4_70%,#eee4d5)] p-5 shadow-none sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#f0e5d6] text-primary">
            <Heart className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Tentang Workspace</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Workspace adalah ruang kolaborasi untuk mempersiapkan pernikahan bersama pasangan, keluarga, dan tim. Setiap workspace memiliki anggaran, daftar tamu, vendor, dan rencana persiapan tersendiri.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
