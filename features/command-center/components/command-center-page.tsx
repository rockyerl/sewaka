"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";

import {
  createTeamMemberAction,
  updateTeamStatusAction,
  deleteTeamMemberAction,
  createIncidentAction,
  updateIncidentStatusAction,
  getCommandCenterTeamAction,
  getCommandCenterIncidentsAction,
  getCommandCenterStatsAction,
} from "../actions/command-center-actions";

interface CommandCenterPageProps {
  workspaceId: string;
}

const STATUS_COLORS = {
  ON_TIME: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DELAYED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  ISSUE: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS = {
  ON_TIME: "Tepat Waktu",
  DELAYED: "Terlambat",
  COMPLETED: "Selesai",
  ISSUE: "Masalah",
};

const SEVERITY_COLORS = {
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

const SEVERITY_LABELS = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  CRITICAL: "Kritis",
};

const ROLE_ICONS: Record<string, string> = {
  MC: "🎤",
  PHOTOGRAPHER: "📸",
  CATERER: "🍽️",
  DECORATOR: "🎨",
  DRIVER: "🚗",
  OTHER: "👤",
};

export function CommandCenterPage({ workspaceId }: CommandCenterPageProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("OTHER");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  const [newIncidentTitle, setNewIncidentTitle] = useState("");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");

  const loadData = () => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const [teamResult, incidentsResult, statsResult] = await Promise.all([
          getCommandCenterTeamAction(workspaceId),
          getCommandCenterIncidentsAction(workspaceId),
          getCommandCenterStatsAction(workspaceId),
        ]);
        setTeam(teamResult);
        setIncidents(incidentsResult);
        setStats(statsResult);
      } catch {
        showToast("Gagal memuat data command center.", "error");
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      showToast("Nama anggota tim harus diisi.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTeamMemberAction({
          workspaceId,
          name: newMemberName.trim(),
          role: newMemberRole,
          phoneNumber: newMemberPhone || undefined,
        });

        if (result.success) {
          showToast("Anggota tim berhasil ditambahkan.", "success");
          setNewMemberName("");
          setNewMemberRole("OTHER");
          setNewMemberPhone("");
          setShowAddMember(false);
          loadData();
        }
      } catch {
        showToast("Gagal menambahkan anggota tim.", "error");
      }
    });
  };

  const handleUpdateStatus = (memberId: string, status: string) => {
    startTransition(async () => {
      try {
        await updateTeamStatusAction({ memberId, workspaceId, status: status as any });
        showToast("Status berhasil diupdate.", "success");
        loadData();
      } catch {
        showToast("Gagal update status.", "error");
      }
    });
  };

  const handleDeleteMember = (memberId: string) => {
    if (!confirm("Yakin ingin menghapus anggota tim ini?")) return;

    startTransition(async () => {
      try {
        await deleteTeamMemberAction(memberId, workspaceId);
        showToast("Anggota tim berhasil dihapus.", "success");
        loadData();
      } catch {
        showToast("Gagal menghapus anggota tim.", "error");
      }
    });
  };

  const handleAddIncident = () => {
    if (!newIncidentTitle.trim()) {
      showToast("Judul insiden harus diisi.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createIncidentAction({
          workspaceId,
          title: newIncidentTitle.trim(),
          description: newIncidentDesc || undefined,
          severity: newIncidentSeverity,
        });

        if (result.success) {
          showToast("Insiden berhasil dilaporkan.", "success");
          setNewIncidentTitle("");
          setNewIncidentDesc("");
          setNewIncidentSeverity("LOW");
          setShowAddIncident(false);
          loadData();
        }
      } catch {
        showToast("Gagal melaporkan insiden.", "error");
      }
    });
  };

  const handleUpdateIncidentStatus = (incidentId: string, status: string) => {
    startTransition(async () => {
      try {
        await updateIncidentStatusAction({ incidentId, workspaceId, status: status as any });
        showToast("Status insiden berhasil diupdate.", "success");
        loadData();
      } catch {
        showToast("Gagal update status insiden.", "error");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#1C1917]">
            Wedding Day Command Center
          </h1>
          <p className="mt-1 text-sm text-[#786C5A]">
            Monitor status kru dan report insiden hari H
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAddMember(true)}>
            <Plus className="mr-2 size-4" />
            Tambah Kru
          </Button>
          <Button variant="outline" onClick={() => setShowAddIncident(true)}>
            <AlertTriangle className="mr-2 size-4" />
            Report Insiden
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Total Kru</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.team?.total ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Tepat Waktu</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.team?.onTime ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-yellow-50 text-yellow-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Terlambat</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.team?.delayed ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Insiden</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.incidents?.open ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Status Grid */}
      <Card className="rounded-2xl border border-border/80 p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-[#1C1917]">
          Status Kru & Vendor
        </h2>

        {team.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-[#786C5A]">
              Belum ada kru. Tambah kru untuk mulai monitoring.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-border/60 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {ROLE_ICONS[member.role] || "👤"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">
                        {member.name}
                      </p>
                      <p className="text-xs text-[#786C5A]">{member.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </div>

                {member.phoneNumber && (
                  <p className="mb-2 flex items-center gap-1 text-xs text-[#786C5A]">
                    <Phone className="size-3" />
                    {member.phoneNumber}
                  </p>
                )}

                <Badge
                  variant="outline"
                  className={`mb-2 border text-[10px] ${
                    STATUS_COLORS[member.status as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {STATUS_LABELS[member.status as keyof typeof STATUS_LABELS]}
                </Badge>

                <div className="flex gap-1">
                  {(["ON_TIME", "DELAYED", "COMPLETED", "ISSUE"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant="ghost"
                        size="sm"
                        className={`h-6 text-[10px] ${
                          member.status === status
                            ? "bg-muted"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleUpdateStatus(member.id, status)}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Incidents Feed */}
      <Card className="rounded-2xl border border-border/80 p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-[#1C1917]">
          Timeline Insiden
        </h2>

        {incidents.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-[#786C5A]">
              Belum ada insiden. Alhamdulillah!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-start gap-4 rounded-xl border border-border/60 p-4"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#1C1917]">
                      {incident.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`border text-[10px] ${
                        SEVERITY_COLORS[
                          incident.severity as keyof typeof SEVERITY_COLORS
                        ]
                      }`}
                    >
                      {
                        SEVERITY_LABELS[
                          incident.severity as keyof typeof SEVERITY_LABELS
                        ]
                      }
                    </Badge>
                    {incident.status === "RESOLVED" && (
                      <Badge
                        variant="outline"
                        className="border text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        Terselesaikan
                      </Badge>
                    )}
                  </div>
                  {incident.description && (
                    <p className="mt-1 text-xs text-[#786C5A]">
                      {incident.description}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-[#a29a90]">
                    {new Date(incident.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {incident.reportedBy && ` • Dilaporkan oleh ${incident.reportedBy}`}
                  </p>
                </div>
                {incident.status !== "RESOLVED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateIncidentStatus(incident.id, "RESOLVED")
                    }
                  >
                    <CheckCircle2 className="mr-1 size-3" />
                    Selesaikan
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1C1917]">
                Tambah Kru
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddMember(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Nama
                </label>
                <Input
                  placeholder="Nama kru atau vendor"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Role
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                >
                  <option value="MC">MC</option>
                  <option value="PHOTOGRAPHER">Photographer</option>
                  <option value="CATERER">Caterer</option>
                  <option value="DECORATOR">Decorator</option>
                  <option value="DRIVER">Driver</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  No. Telepon (opsional)
                </label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAddMember} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Tambah
                </Button>
                <Button variant="outline" onClick={() => setShowAddMember(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Incident Modal */}
      {showAddIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1C1917]">
                Report Insiden
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddIncident(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Judul
                </label>
                <Input
                  placeholder="Contoh: Catering terlambat 30 menit"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Deskripsi (opsional)
                </label>
                <Textarea
                  placeholder="Detail insiden..."
                  value={newIncidentDesc}
                  onChange={(e) => setNewIncidentDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Tingkat Keparahan
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                  value={newIncidentSeverity}
                  onChange={(e) =>
                    setNewIncidentSeverity(e.target.value as any)
                  }
                >
                  <option value="LOW">Rendah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="CRITICAL">Kritis</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAddIncident} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Report
                </Button>
                <Button variant="outline" onClick={() => setShowAddIncident(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
