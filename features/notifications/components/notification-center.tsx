"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  ListTodo,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/page-components";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import {
  markNotificationReadAction,
  markAllNotificationReadAction,
} from "../actions/notification-actions";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: "UNREAD" | "READ";
  entityType?: string | null;
  entityId?: string | null;
  createdAt: Date | string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

function getNotificationVisuals(type: string) {
  switch (type) {
    case "DUE_DATE":
    case "TASK_REMINDER":
      return {
        icon: <Clock className="size-4 text-amber-700" />,
        bg: "bg-amber-100/80 border-amber-300",
        link: "/tasks",
        linkLabel: "Buka Checklist",
      };
    case "BUDGET_ALERT":
      return {
        icon: <DollarSign className="size-4 text-rose-700" />,
        bg: "bg-rose-100/80 border-rose-300",
        link: "/budget",
        linkLabel: "Cek Anggaran",
      };
    case "INVITATION":
      return {
        icon: <Heart className="size-4 text-emerald-700" />,
        bg: "bg-emerald-100/80 border-emerald-300",
        link: "/guests",
        linkLabel: "Daftar Tamu",
      };
    default:
      return {
        icon: <Sparkles className="size-4 text-[#5B132B]" />,
        bg: "bg-[#FAF5EC] border-[#E6D5B8]",
        link: "/dashboard",
        linkLabel: "Dashboard",
      };
  }
}

export function NotificationCenter({ notifications: initialList }: NotificationCenterProps) {
  const [items, setItems] = useState<NotificationItem[]>(initialList);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Keep state updated if initialList changes from SSR
  const unreadCount = items.filter((n) => n.read === "UNREAD").length;

  const handleMarkSingleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: "READ" } : item)),
    );
    startTransition(async () => {
      const fd = new FormData();
      fd.append("notificationId", id);
      await markNotificationReadAction(fd);
    });
  };

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: "READ" })));
    startTransition(async () => {
      await markAllNotificationReadAction();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full text-foreground/80 hover:bg-muted/80 hover:text-foreground"
          aria-label="Buka notifikasi dan pengingat"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4.5 h-4.5 px-1 place-items-center rounded-full bg-[#9b4a4a] text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 shadow-2xl rounded-2xl border-border/80 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-[#faf7f2]/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-sm font-semibold tracking-tight text-foreground">
              Notifikasi & Pengingat
            </h3>
            {unreadCount > 0 && (
              <Badge className="bg-[#9b4a4a] text-white text-[10px] px-1.5 py-0 h-4 font-medium">
                {unreadCount} baru
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-[11px] text-[#5B132B] hover:text-[#3D0B1C] hover:bg-[#5B132B]/10 px-2 rounded-lg"
            >
              <Check className="size-3.5 mr-1" /> Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
          {items.length > 0 ? (
            items.map((n) => {
              const visual = getNotificationVisuals(n.type);
              const isUnread = n.read === "UNREAD";
              const dateStr = formatDateIndonesia(n.createdAt, {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
              });

              return (
                <div
                  key={n.id}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors ${
                    isUnread
                      ? "bg-[#faf7f2]/90 hover:bg-[#faf7f2]"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {/* Category icon */}
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-xl border text-xs shadow-xs mt-0.5 ${visual.bg}`}
                  >
                    {visual.icon}
                  </span>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="size-1.5 shrink-0 rounded-full bg-[#9b4a4a]" />
                        )}
                        <p
                          className={`truncate text-xs ${
                            isUnread
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/80"
                          }`}
                        >
                          {n.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {dateStr}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Action link & mark read */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Link
                        href={visual.link}
                        onClick={() => {
                          if (isUnread) handleMarkSingleRead(n.id);
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B132B] hover:underline"
                      >
                        <span>{visual.linkLabel}</span>
                        <ChevronRight className="size-3" />
                      </Link>

                      {isUnread && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleMarkSingleRead(n.id, e)}
                          className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground rounded"
                          title="Tandai sudah dibaca"
                        >
                          <Check className="size-3 mr-1" />
                          Dibaca
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState message="Semua persiapan berjalan lancar. Belum ada pengingat atau peringatan baru." icon={Sparkles} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/70 bg-muted/30 px-4 py-2 text-center text-[10px] text-muted-foreground">
          Pengingat otomatis diperbarui berdasarkan tenggat, anggaran, dan RSVP
        </div>
      </PopoverContent>
    </Popover>
  );
}
