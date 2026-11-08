"use client";

import { useState, useCallback } from "react";
import { Send, Check, X, AlertCircle, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Guest } from "../hooks/guest-queries";
import { bulkWaInviteAction } from "../actions/bulk-invite-actions";

interface BulkInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
}

export function BulkInviteDialog({ open, onOpenChange, guests }: BulkInviteDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ name: string; phone: string; link: string }[] | null>(null);

  const toggleGuest = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === guests.length) {
        return new Set();
      }
      return new Set(guests.map((g) => g.id));
    });
  }, [guests]);

  const handleSend = async () => {
    if (selectedIds.size === 0) {
      setError("Pilih minimal 1 tamu.");
      return;
    }
    if (selectedIds.size > 50) {
      setError("Maksimal 50 tamu per batch.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await bulkWaInviteAction(Array.from(selectedIds));
      if (result.success) {
        setResults(result.links);
      } else {
        setError(result.error || "Gagal generate link undangan.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setError(null);
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-[#D4AF37]" />
            Kirim Undangan Massal via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Pilih tamu yang ingin menerima undangan, lalu generate link WhatsApp personal untuk masing-masing tamu.
          </DialogDescription>
        </DialogHeader>

        {/* Selection controls */}
        <div className="flex items-center justify-between rounded-xl border border-[#E6D5B8] bg-[#FAF5EC] p-3">
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-2 text-xs font-medium text-[#5B132B] hover:underline"
          >
            {selectedIds.size === guests.length ? (
              <>
                <X className="size-3.5" />
                Batal Pilih Semua
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Pilih Semua ({guests.length})
              </>
            )}
          </button>
          <Badge variant="secondary" className="text-xs">
            {selectedIds.size} dipilih
            {selectedIds.size > 50 && (
              <span className="ml-1 text-red-600">
                (max 50)
              </span>
            )}
          </Badge>
        </div>

        {/* Guest list */}
        <div className="max-h-60 overflow-y-auto rounded-xl border border-[#E6D5B8]">
          {guests.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Tidak ada tamu dalam daftar.
            </div>
          ) : (
            <div className="divide-y divide-[#E6D5B8]/60">
              {guests.map((guest) => (
                <label
                  key={guest.id}
                  className={`flex items-center gap-3 p-3 transition-colors hover:bg-[#FAF5EC] ${
                    selectedIds.has(guest.id) ? "bg-[#FAF5EC]" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(guest.id)}
                    onChange={() => toggleGuest(guest.id)}
                    className="size-4 rounded border-[#D4AF37] text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <Users className="size-3.5 shrink-0 text-[#a29a90]" />
                  <span className="flex-1 text-sm font-medium text-foreground">{guest.name}</span>
                  {guest.isVip && (
                    <Badge variant="secondary" className="text-[10px]">
                      VIP
                    </Badge>
                  )}
                  {guest.category && (
                    <span className="text-[10px] text-muted-foreground">{guest.category}</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              ✅ Link WhatsApp berhasil di-generate untuk {results.length} tamu:
            </p>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-[#E6D5B8] divide-y divide-[#E6D5B8]/60">
              {results.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3">
                  <span className="flex-1 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({item.phone})</span>
                  </span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#20BD5A] transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    Buka WA
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Tutup
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={loading || selectedIds.size === 0 || selectedIds.size > 50}
            className="bg-[#5B132B] text-white hover:bg-[#3D0B1C]"
          >
            {loading ? (
              "Menghasilkan Link..."
            ) : (
              <>
                <Send className="size-3.5 mr-1.5" />
                Generate Link WhatsApp ({selectedIds.size})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
