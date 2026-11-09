"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus,
  Trash2,
  Users,
  User,
  X,
  Loader2,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";

import {
  createTableAction,
  deleteTableAction,
  assignSeatAction,
  removeSeatAction,
  getSeatingPlanAction,
  getUnassignedGuestsAction,
} from "../actions/seating-planner-actions";

interface SeatingPlannerPageProps {
  workspaceId: string;
}

interface TableData {
  id: string;
  tableName: string;
  capacity: number;
  positionX: number;
  positionY: number;
  notes: string | null;
  assignments: Array<{
    guestId: string;
    guestName: string | null;
    seatNumber: number | null;
  }>;
  assignedCount: number;
}

interface GuestData {
  id: string;
  name: string;
  category: string | null;
  side: string | null;
  isVip: boolean;
}

export function SeatingPlannerPage({ workspaceId }: SeatingPlannerPageProps) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<GuestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAddTable, setShowAddTable] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(10);

  const loadData = () => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const [tablesResult, guestsResult] = await Promise.all([
          getSeatingPlanAction(workspaceId),
          getUnassignedGuestsAction(workspaceId),
        ]);
        setTables(tablesResult);
        setUnassignedGuests(guestsResult);
      } catch {
        showToast("Gagal memuat data seating planner.", "error");
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleAddTable = () => {
    if (!newTableName.trim()) {
      showToast("Nama meja harus diisi.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTableAction({
          workspaceId,
          tableName: newTableName.trim(),
          capacity: newTableCapacity,
        });

        if (result.success) {
          showToast("Meja berhasil ditambahkan.", "success");
          setNewTableName("");
          setNewTableCapacity(10);
          setShowAddTable(false);
          loadData();
        }
      } catch {
        showToast("Gagal menambahkan meja.", "error");
      }
    });
  };

  const handleDeleteTable = (tableId: string) => {
    if (!confirm("Yakin ingin menghapus meja ini? Semua assignment akan dihapus.")) return;

    startTransition(async () => {
      try {
        const result = await deleteTableAction(tableId, workspaceId);
        if (result.success) {
          showToast("Meja berhasil dihapus.", "success");
          loadData();
        }
      } catch {
        showToast("Gagal menghapus meja.", "error");
      }
    });
  };

  const handleAssignGuest = (tableId: string, guestId: string) => {
    startTransition(async () => {
      try {
        const result = await assignSeatAction({
          workspaceId,
          tableId,
          guestId,
        });

        if (result.success) {
          showToast("Tamu berhasil di-assign.", "success");
          setShowGuestPicker(null);
          loadData();
        } else {
          showToast(result.error || "Gagal assign tamu.", "error");
        }
      } catch {
        showToast("Gagal assign tamu.", "error");
      }
    });
  };

  const handleRemoveGuest = (tableId: string, guestId: string) => {
    startTransition(async () => {
      try {
        const result = await removeSeatAction(guestId, tableId, workspaceId);
        if (result.success) {
          showToast("Tamu berhasil dihapus dari meja.", "success");
          loadData();
        }
      } catch {
        showToast("Gagal menghapus assignment.", "error");
      }
    });
  };

  const filteredGuests = unassignedGuests.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Seating Planner
          </h1>
          <p className="mt-1 text-sm text-[#786C5A]">
            Atur penempatan tamu di meja-meja pernikahan
          </p>
        </div>
        <Button onClick={() => setShowAddTable(true)}>
          <Plus className="mr-2 size-4" />
          Tambah Meja
        </Button>
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1C1917]">
                Tambah Meja Baru
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddTable(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Nama Meja
                </label>
                <Input
                  placeholder="Contoh: Meja Utama, Meja 1, dll"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#786C5A]">
                  Kapasitas
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAddTable} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Tambah
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddTable(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Guest Picker Modal */}
      {showGuestPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1C1917]">
                Pilih Tamu
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuestPicker(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari tamu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[#786C5A]">
                    Tidak ada tamu ditemukan.
                  </p>
                ) : (
                  filteredGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1C1917]">
                          {guest.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {guest.isVip && (
                            <Badge variant="outline" className="text-[10px]">
                              VIP
                            </Badge>
                          )}
                          {guest.side && (
                            <Badge variant="outline" className="text-[10px]">
                              {guest.side}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignGuest(showGuestPicker, guest.id)}
                        disabled={isPending}
                      >
                        <User className="mr-1 size-3" />
                        Assign
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Card className="rounded-2xl border border-border/80 p-12 text-center">
          <Users className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-[#786C5A]">
            Belum ada meja. Tambah meja untuk mulai mengatur seating.
          </p>
          <Button className="mt-4" onClick={() => setShowAddTable(true)}>
            <Plus className="mr-2 size-4" />
            Tambah Meja
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Card
              key={table.id}
              className="rounded-2xl border border-border/80 p-5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#1C1917]">
                    {table.tableName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        table.assignedCount >= table.capacity
                          ? "bg-red-50 text-red-700 border-red-200"
                          : table.assignedCount >= table.capacity * 0.8
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {table.assignedCount}/{table.capacity} tamu
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuestPicker(table.id)}
                    disabled={table.assignedCount >= table.capacity}
                  >
                    <User className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTable(table.id)}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Guest List */}
              {table.assignments.length > 0 ? (
                <div className="space-y-2">
                  {table.assignments.map((assignment) => (
                    <div
                      key={assignment.guestId}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <span className="text-sm text-[#1C1917]">
                          {assignment.guestName || "-"}
                        </span>
                        {assignment.seatNumber && (
                          <Badge variant="outline" className="text-[10px]">
                            Seat {assignment.seatNumber}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveGuest(table.id, assignment.guestId)
                        }
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-xs text-[#a29a90]">
                  Belum ada tamu di meja ini.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF5EC]/50 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[#786C5A]">Total Meja</p>
            <p className="mt-1 text-2xl font-semibold text-[#1C1917]">
              {tables.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#786C5A]">Total Kapasitas</p>
            <p className="mt-1 text-2xl font-semibold text-[#1C1917]">
              {tables.reduce((sum, t) => sum + t.capacity, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#786C5A]">Tamu Ter-assign</p>
            <p className="mt-1 text-2xl font-semibold text-[#1C1917]">
              {tables.reduce((sum, t) => sum + t.assignedCount, 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
