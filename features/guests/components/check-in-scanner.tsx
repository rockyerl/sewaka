"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Loader2, QrCode as Scan, XCircle, Wifi, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCheckInQueue } from "@/features/guests/hooks/use-check-in-queue";
import { useCheckInSync } from "@/features/guests/hooks/use-check-in-sync";
import { CheckInQueueEntry } from "@/features/guests/hooks/use-check-in-queue";

interface GuestSearchResult {
  id: string;
  name: string;
  invitationCode: string;
}

export function CheckInScanner({
  workspaceId,
  onCheckIn,
}: {
  workspaceId: string;
  onCheckIn: () => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"scan" | "search">("scan");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { queue, isOnline, pendingCount, enqueue, clearQueue } = useCheckInQueue(workspaceId);

  const handleSync = useCallback(
    async (entries: CheckInQueueEntry[]) => {
      try {
        const res = await fetch("/api/v1/guests/check-in/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId, entries }),
        });

        if (res.ok) {
          const data = await res.json();
          clearQueue();
          onCheckIn();
          return {
            success: data.result?.success || 0,
            failed: data.result?.failed || 0,
            conflicts: data.result?.conflicts || 0,
          };
        }
        return { success: 0, failed: entries.length, conflicts: 0 };
      } catch {
        return { success: 0, failed: entries.length, conflicts: 0 };
      }
    },
    [workspaceId, clearQueue, onCheckIn]
  );

  const { isSyncing, syncQueue } = useCheckInSync({
    workspaceId,
    queue,
    onSync: handleSync,
    onSyncComplete: () => {
      setStatus("success");
      setMessage("Sync selesai!");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    },
  });

  const handleCheckIn = async () => {
    if (!code.trim()) return;

    // Offline mode: enqueue to LocalStorage
    if (!isOnline) {
      const added = enqueue(code.trim());
      if (added) {
        setStatus("success");
        setMessage(`✓ ${code.trim()} ditambahkan ke antrian offline (${pendingCount + 1} pending)`);
        setCode("");
      } else {
        setStatus("error");
        setMessage("Kode sudah ada di antrian.");
      }
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
      return;
    }

    // Online mode: direct API call
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("invitationCode", code.trim());

      const res = await fetch("/api/v1/guests/check-in", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Check-in berhasil!");
        setCode("");
        onCheckIn();
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Kode tidak ditemukan atau sudah check-in.");
      }
    } catch {
      // Network error - try offline mode
      const added = enqueue(code.trim());
      if (added) {
        setStatus("success");
        setMessage("Koneksi hilang. Ditambahkan ke antrian offline.");
      } else {
        setStatus("error");
        setMessage("Gagal melakukan check-in.");
      }
      setCode("");
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearchLoading(true);

    try {
      const res = await fetch(
        `/api/v1/guests?workspaceId=${workspaceId}&search=${encodeURIComponent(searchQuery.trim())}&limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.guests || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, workspaceId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleGuestSelect = async (guest: GuestSearchResult) => {
    if (!isOnline) {
      enqueue(guest.invitationCode || "", guest.id);
      setStatus("success");
      setMessage(`✓ ${guest.name} ditambahkan ke antrian offline`);
    } else {
      setStatus("loading");
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("invitationCode", guest.invitationCode || "");

        const res = await fetch("/api/v1/guests/check-in", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setStatus("success");
          setMessage(`✓ ${guest.name} check-in berhasil!`);
          onCheckIn();
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(data.error || "Gagal check-in.");
        }
      } catch {
        enqueue(guest.invitationCode || "", guest.id);
        setStatus("success");
        setMessage(`Koneksi hilang. ${guest.name} ditambahkan ke antrian offline.`);
      }
    }
    setSearchQuery("");
    setSearchResults([]);
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn();
  };

  return (
    <Card className="rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="size-4 text-primary" />
          <h2 className="font-serif text-lg font-medium">Check-in Tamu</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Online/Offline indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isOnline ? (
              <Wifi className="size-3" />
            ) : (
              <Wifi className="size-3 opacity-50" />
            )}
            {isOnline ? "Online" : "Offline"}
          </div>
          {/* Pending queue counter */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              <Users className="size-3" />
              {pendingCount} pending
            </div>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {isOnline
          ? "Masukkan invitation code atau cari nama tamu untuk check-in."
          : "Mode offline: Check-in akan disinkronkan saat koneksi kembali."}
      </p>

      {/* Mode toggle */}
      <div className="mt-4 flex gap-2">
        <Button
          variant={mode === "scan" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("scan")}
          className="text-xs"
        >
          <Scan className="size-3 mr-1" /> Scan QR
        </Button>
        <Button
          variant={mode === "search" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("search")}
          className="text-xs"
        >
          <Search className="size-3 mr-1" /> Cari Tamu
        </Button>
        {pendingCount > 0 && !isOnline && (
          <Button variant="outline" size="sm" onClick={syncQueue} disabled={isSyncing} className="text-xs ml-auto">
            {isSyncing ? (
              <>
                <Loader2 className="size-3 mr-1 animate-spin" /> Syncing...
              </>
            ) : (
              <>
                <Wifi className="size-3 mr-1" /> Sync ({pendingCount})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Scan Mode */}
      {mode === "scan" && (
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Masukkan kode undangan..."
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={20}
            disabled={status === "loading"}
          />
          <Button type="submit" disabled={status === "loading" || !code.trim()} className="h-10">
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" /> Check-in
              </>
            )}
          </Button>
        </form>
      )}

      {/* Search Mode */}
      {mode === "search" && (
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tamu..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={searchLoading}
            />
            {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-background">
              {searchResults.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleGuestSelect(guest)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                >
                  <div className="text-left">
                    <p className="font-medium">{guest.name}</p>
                    {guest.invitationCode && (
                      <p className="text-xs text-muted-foreground font-mono">{guest.invitationCode}</p>
                    )}
                  </div>
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status messages */}
      {status !== "idle" && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
            status === "success"
              ? "bg-[#edf3e9] text-[#527553]"
              : "bg-[#f4e9e9] text-[#9b4a4a]"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : status === "error" ? (
            <XCircle className="size-4 shrink-0" />
          ) : null}
          {message}
        </div>
      )}

      {/* Offline queue info */}
      {pendingCount > 0 && (
        <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-700">
            <strong>{pendingCount}</strong> check-in menunggu sync. Akan otomatis disinkronkan saat koneksi kembali.
          </p>
        </div>
      )}
    </Card>
  );
}
