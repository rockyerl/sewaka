"use client";

import { useState, useEffect, useTransition } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Bell,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

import {
  getWaMessageStatsAction,
  getWaMessageHistoryAction,
  scheduleReminderAction,
  type WaStats,
} from "../actions/whatsapp-rsvp-actions";

interface WhatsAppRSVPDashboardProps {
  workspaceId: string;
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SENT: "bg-blue-100 text-blue-800 border-blue-200",
  DELIVERED: "bg-purple-100 text-purple-800 border-purple-200",
  READ: "bg-emerald-100 text-emerald-800 border-emerald-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS = {
  PENDING: "Menunggu",
  SENT: "Terkirim",
  DELIVERED: "Diterima",
  READ: "Dibaca",
  FAILED: "Gagal",
};

const MESSAGE_TYPE_LABELS = {
  INVITE: "Undangan",
  REMINDER_7D: "Reminder 7 Hari",
  REMINDER_1D: "Reminder 1 Hari",
  CUSTOM: "Custom",
};

export function WhatsAppRSVPDashboard({ workspaceId }: WhatsAppRSVPDashboardProps) {
  const [stats, setStats] = useState<WaStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const [statsResult, historyResult] = await Promise.all([
          getWaMessageStatsAction(workspaceId),
          getWaMessageHistoryAction(workspaceId),
        ]);
        setStats(statsResult);
        setHistory(historyResult);
      } catch (err) {
        showToast("Gagal memuat data WhatsApp.", "error");
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleScheduleReminder = async (daysBefore: number) => {
    startTransition(async () => {
      try {
        const result = await scheduleReminderAction(workspaceId, daysBefore);
        if (result.success) {
          showToast(
            `Reminder berhasil dijadwalkan untuk ${result.scheduled} tamu.`,
            "success"
          );
          loadData();
        } else {
          showToast(result.error || "Gagal menjadwalkan reminder.", "error");
        }
      } catch {
        showToast("Gagal menjadwalkan reminder.", "error");
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
            WhatsApp RSVP Automation
          </h1>
          <p className="mt-1 text-sm text-[#786C5A]">
            Monitor dan kelola pesan WhatsApp ke tamu undangan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            disabled={isPending}
          >
            <RefreshCw className={`mr-2 size-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScheduleReminder(7)}
            disabled={isPending}
          >
            <Bell className="mr-2 size-4" />
            Reminder 7 Hari
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScheduleReminder(1)}
            disabled={isPending}
          >
            <Bell className="mr-2 size-4" />
            Reminder 1 Hari
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Total</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.total ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Send className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Terkirim</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.sent ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Diterima</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.delivered ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Eye className="size-5" />
            </div>
            <div>
              <p className="text-xs text-[#786C5A]">Dibaca</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.read ?? 0}
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
              <p className="text-xs text-[#786C5A]">Menunggu</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.pending ?? 0}
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
              <p className="text-xs text-[#786C5A]">Gagal</p>
              <p className="text-xl font-semibold text-[#1C1917]">
                {stats?.failed ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Message History */}
      <Card className="rounded-2xl border border-border/80 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="size-5 text-[#786C5A]" />
          <h2 className="font-serif text-lg font-medium text-[#1C1917]">
            Riwayat Pesan
          </h2>
          <Badge variant="outline" className="ml-auto text-xs">
            {history.length} pesan
          </Badge>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-[#786C5A]">
              Belum ada pesan WhatsApp yang dikirim.
            </p>
            <p className="mt-1 text-xs text-[#a29a90]">
              Gunakan fitur Bulk Invite untuk mengirim pesan ke tamu.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((message) => (
              <div
                key={message.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  <MessageSquare className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#1C1917]">
                      {message.guestName}
                    </p>
                    <Badge
                      variant="outline"
                      className={`border text-[10px] ${
                        STATUS_COLORS[message.status as keyof typeof STATUS_COLORS]
                      }`}
                    >
                      {STATUS_LABELS[message.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border text-[10px] text-muted-foreground"
                    >
                      {MESSAGE_TYPE_LABELS[message.messageType as keyof typeof MESSAGE_TYPE_LABELS]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#786C5A]">
                    {message.phoneNumber}
                  </p>
                  {message.errorMessage && (
                    <p className="mt-0.5 truncate text-xs text-red-600">
                      {message.errorMessage}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-[#786C5A]">
                    {message.sentAt
                      ? new Date(message.sentAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF5EC]/50 p-6">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 size-5 shrink-0 text-[#D4AF37]" />
          <div>
            <h3 className="font-medium text-[#1C1917]">Cara Kerja WhatsApp RSVP</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-[#786C5A]">
              <li>• Gunakan <strong>Bulk Invite</strong> di halaman Tamu untuk mengirim undangan via WhatsApp</li>
              <li>• Sistem akan generate link WhatsApp personal per tamu dengan pesan yang sudah terisi</li>
              <li>• <strong>Reminder</strong> akan mengirim pesan pengingat ke tamu yang belum RSVP</li>
              <li>• Status pesan akan di-track di dashboard ini untuk monitoring</li>
              <li>• Template pesan mendukung variabel: <code className="rounded bg-muted px-1 py-0.5">{`{guest_name}`}</code>, <code className="rounded bg-muted px-1 py-0.5">{`{couple_name}`}</code>, <code className="rounded bg-muted px-1 py-0.5">{`{invite_link}`}</code></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
