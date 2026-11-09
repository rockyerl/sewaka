"use client";

import { useState, useTransition } from "react";
import { Mail, Send, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendEmailInviteAction, bulkEmailInviteAction } from "@/features/email-invite/actions/email-invite-actions";

export interface GuestWithEmail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export function EmailInviteDialog({
  workspaceId,
  guests,
  children,
}: {
  workspaceId: string;
  guests: GuestWithEmail[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const guestsWithEmail = guests.filter((g) => g.email);

  const toggleGuest = (id: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedGuests(new Set(guestsWithEmail.map((g) => g.id)));
  };

  const deselectAll = () => {
    setSelectedGuests(new Set());
  };

  const handleSend = () => {
    if (selectedGuests.size === 0) {
      setStatus({ type: "error", message: "Pilih minimal 1 tamu" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await bulkEmailInviteAction({
          workspaceId,
          guestIds: Array.from(selectedGuests),
          subject: subject || undefined,
          body: body || undefined,
        });

        if (result.success) {
          setStatus({
            type: "success",
            message: `Berhasil mengirim ${result.sent} email${result.failed > 0 ? `, ${result.failed} gagal` : ""}`,
          });
          setSelectedGuests(new Set());
          setTimeout(() => {
            setStatus({ type: null, message: "" });
            if (result.failed === 0) setOpen(false);
          }, 3000);
        } else {
          setStatus({ type: "error", message: result.error || "Gagal mengirim email" });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Gagal mengirim email" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Kirim Undangan via Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          {status.type && (
            <div
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                status.type === "success"
                  ? "border-[#527553]/30 bg-[#527553]/5 text-[#527553]"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              {status.message}
            </div>
          )}

          {/* Template customization */}
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Subjek Email
              </label>
              <Input
                placeholder="Undangan Pernikahan [Nama Mempelai]"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Pesan Tambahan (Opsional)
              </label>
              <Textarea
                placeholder="Tambahkan pesan personal di sini..."
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          {/* Guest selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Pilih Tamu ({guestsWithEmail.length} tamu dengan email)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  Pilih Semua
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className="text-xs"
                >
                  Batal Semua
                </Button>
              </div>
            </div>

            {guestsWithEmail.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Tidak ada tamu dengan email. Tambahkan email di daftar tamu.
                </p>
              </div>
            ) : (
              <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border">
                {guestsWithEmail.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => toggleGuest(guest.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                      selectedGuests.has(guest.id)
                        ? "bg-[#5B132B]/5 hover:bg-[#5B132B]/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        selectedGuests.has(guest.id)
                          ? "border-[#5B132B] bg-[#5B132B]"
                          : "border-border"
                      }`}
                    >
                      {selectedGuests.has(guest.id) && (
                        <CheckCircle2 className="size-3 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {guest.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {guest.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedGuests.size > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedGuests.size} tamu dipilih
              </p>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={isPending || selectedGuests.size === 0 || guestsWithEmail.length === 0}
            className="w-full"
          >
            {isPending ? (
              "Mengirim..."
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Kirim {selectedGuests.size > 0 ? `ke ${selectedGuests.size} Tamu` : "Email"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
