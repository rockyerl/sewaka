import { Heart, MapPin, CalendarDays } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { auth } from "@/auth";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import { WorkspaceMembersSection } from "@/features/workspaces/components/workspace-members";


async function WorkspacesPageContent({
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

  const formatCurrency = (value: string | null) => {
    if (!value || Number(value) === 0) return "Belum diatur";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <>
      <section className="mb-6">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
          PENGATURAN
        </p>
        <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-[38px]">
          Workspace Pernikahan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kelola workspace pernikahan dan pengaturan kolaborasi.
        </p>
      </section>

      {/* Workspaces List */}
      <Card className="mb-5 gap-5 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#a08f74]">
            WORKSPACE KAMU
          </p>
          <h2 className="font-serif text-xl font-medium tracking-tight">Daftar Workspace</h2>
        </div>
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
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(ws.weddingDate)}
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
                      {formatCurrency(ws.totalBudget)}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : null}
      </Card>

      {/* Workspace Members */}
      {currentWorkspaceId && <WorkspaceMembersSection workspaceId={currentWorkspaceId} currentUserId={currentUserId} />}

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

export const instant = false;

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const currentWorkspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];

  return (
    <WorkspacesPageContent
      workspaces={workspaces}
      currentWorkspaceId={currentWorkspace?.id ?? ""}
      currentUserId={userId}
    />
  );
}
