"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  ExternalLink,
  Loader2,
  Send,
  Trash2,
  MessageCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";

import {
  generateThankYouAction,
  sendThankYouAction,
  deleteThankYouAction,
  getThankYouMessagesAction,
} from "../actions/guest-thank-you-actions";

interface GuestThankYouPageProps {
  workspaceId: string;
}

const DEFAULT_TEMPLATE =
  "Halo {guestName}! Kami, {coupleName}, ingin mengucapkan terima kasih banyak atas kehadiran dan doa restu Anda di pernikahan kami. Semoga kita selalu diberikan kebahagiaan. 🙏❤️";

type MessageItem = {
  id: string;
  guestId: string;
  messageTemplate: string;
  messagePersonalized: string | null;
  channel: "WHATSAPP" | "EMAIL";
  status: "PENDING" | "SENT" | "FAILED";
  sentAt: string | null;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
};

export function GuestThankYouPage({ workspaceId }: GuestThankYouPageProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [channel, setChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");

  useEffect(() => {
    let ignore = false;
    getThankYouMessagesAction(workspaceId).then((result) => {
      if (!ignore) {
        setMessages(result);
        setIsLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [workspaceId]);

  const loadMessages = useCallback(() => {
    setIsLoading(true);
    getThankYouMessagesAction(workspaceId).then((result) => {
      setMessages(result);
      setIsLoading(false);
    });
  }, [workspaceId]);

  const handleGenerate = () => {
    if (messageTemplate.trim().length < 10) {
      showToast("Template pesan minimal 10 karakter.", "warning");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateThankYouAction(
          workspaceId,
          messageTemplate.trim(),
          channel
        );

        if (result.success) {
          showToast(result.message, "success");
          loadMessages();
        } else {
          showToast(result.message, "warning");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal generate pesan.",
          "error"
        );
      }
    });
  };

  const handleSend = () => {
    startTransition(async () => {
      try {
        const result = await sendThankYouAction(workspaceId);
        if (result.success) {
          showToast(result.message, "success");
          loadMessages();
        } else {
          showToast(result.message, "error");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal mengirim pesan.",
          "error"
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Hapus semua pesan thank you?")) return;

    startTransition(async () => {
      try {
        const result = await deleteThankYouAction(workspaceId);
        if (result.success) {
          showToast(result.message, "success");
          loadMessages();
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal hapus pesan.",
          "error"
        );
      }
    });
  };

  const pendingCount = messages.filter((m) => m.status === "PENDING").length;
  const sentCount = messages.filter((m) => m.status === "SENT").length;
  const failedCount = messages.filter((m) => m.status === "FAILED").length;

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Guest Thank You</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kirim ucapan terima kasih otomatis ke tamu setelah pernikahan
        </p>
      </div>

      {/* Stats */}
      {messages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Terkirim</p>
                <p className="text-2xl font-bold text-green-500">{sentCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Gagal</p>
                <p className="text-2xl font-bold text-red-500">{failedCount}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Template Editor */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground">Template Pesan</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Gunakan <code className="rounded bg-muted px-1 text-xs">{"{guestName}"}</code> untuk nama tamu dan <code className="rounded bg-muted px-1 text-xs">{"{coupleName}"}</code> untuk nama mempelai
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Channel
            </label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setChannel("WHATSAPP")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${
                  channel === "WHATSAPP"
                    ? "border-[#5B132B] bg-[#5B132B]/10 text-[#5B132B]"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel("EMAIL")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${
                  channel === "EMAIL"
                    ? "border-[#5B132B] bg-[#5B132B]/10 text-[#5B132B]"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <Mail className="size-4" />
                Email
              </button>
            </div>
          </div>

          <Textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className="min-h-[120px]"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {messageTemplate.length}/2000 karakter
          </p>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">Preview:</p>
            <p className="mt-2 text-sm text-foreground">
              {messageTemplate
                .replace(/{guestName}/g, "Budi Santoso")
                .replace(/{coupleName}/g, "Rizky & Sarah")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isPending || messageTemplate.trim().length < 10}
              className="flex-1 bg-[#5B132B] text-white hover:bg-[#5B132B]/90"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Generate Pesan untuk Semua Tamu
            </Button>
          </div>
        </div>
      </Card>

      {/* Actions */}
      {messages.length > 0 && (
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button
              onClick={handleSend}
              disabled={isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Kirim {pendingCount} Pesan Pending
            </Button>
          )}
          <Button variant="outline" onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 size-4" />
            Hapus Semua
          </Button>
        </div>
      )}

      {/* Messages List */}
      {messages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Daftar Pesan</h3>
          {messages.slice(0, 20).map((msg) => {
            const waLink = msg.channel === "WHATSAPP" && msg.guestPhone
              ? `https://wa.me/${msg.guestPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg.messagePersonalized || msg.messageTemplate)}`
              : null;

            return (
              <Card key={msg.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {msg.guestName || "Tamu"}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {msg.channel === "WHATSAPP" ? "WhatsApp" : "Email"}
                      </Badge>
                      {msg.status === "PENDING" && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px]">
                          Pending
                        </Badge>
                      )}
                      {msg.status === "SENT" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px]">
                          Terkirim
                        </Badge>
                      )}
                      {msg.status === "FAILED" && (
                        <Badge variant="destructive" className="text-[10px]">
                          Gagal
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {msg.messagePersonalized}
                    </p>
                    {msg.sentAt && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {new Date(msg.sentAt).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  {waLink && msg.status === "SENT" && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      <ExternalLink className="size-3" />
                      Buka WA
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
          {messages.length > 20 && (
            <p className="text-center text-sm text-muted-foreground">
              Dan {messages.length - 20} pesan lainnya...
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
          <MessageCircle className="mx-auto size-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold text-foreground">
            Belum ada pesan thank you
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Buat template pesan di atas dan klik &quot;Generate&quot; untuk membuat pesan untuk semua tamu
          </p>
        </div>
      )}
    </div>
  );
}
