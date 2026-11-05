import { Bell, Check } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { listNotifications, getUnreadCount } from "@/features/notifications/queries/notification-queries";
import { markNotificationReadAction, markAllNotificationReadAction } from "@/features/notifications/actions/notification-actions";

function notificationTypeIcon(type: string) {
  const map: Record<string, string> = {
    TASK_REMINDER: "📋",
    DUE_DATE: "⏰",
    BUDGET_ALERT: "💰",
    INVITATION: "✉️",
    SYSTEM: "⚙️",
  };
  return map[type] ?? "🔔";
}

export async function NotificationBell() {
  const unreadCount = await getUnreadCount();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative h-8 w-8 p-0"
    >
      <Bell className="size-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#9b4a4a] text-[9px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
}

export async function NotificationPanel() {
  const notifications = await listNotifications();
  const unreadCount = notifications.filter((n) => n.read === "UNREAD").length;

  return (
    <Card className="mb-5 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-[9px] font-semibold tracking-[0.14em] text-[#a08f74]">
            NOTIFIKASI
          </p>
          <h3 className="font-serif text-sm font-medium tracking-tight">
            Pusat Notifikasi
          </h3>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationReadAction}>
            <Button type="submit" variant="outline" size="sm" className="h-7 text-[10px]">
              <Check className="size-3" /> Tandai semua dibaca
            </Button>
          </form>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="divide-y divide-border/40">
          {notifications.slice(0, 10).map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 py-2.5 ${
                n.read === "UNREAD" ? "bg-muted/30 -mx-2 px-2 rounded-lg" : ""
              }`}
            >
              <span className="text-lg shrink-0 mt-0.5">
                {notificationTypeIcon(n.type)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium truncate">{n.title}</p>
                  {n.read === "UNREAD" && (
                    <span className="size-2 shrink-0 rounded-full bg-[#9b4a4a]" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {format(new Date(n.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              {n.read === "UNREAD" && (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={n.id} />
                  <Button type="submit" variant="ghost" size="sm" className="size-6 p-0">
                    <Check className="size-3" />
                  </Button>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-muted/60 p-6 text-center">
          <Bell className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">
            Belum ada notifikasi.
          </p>
        </div>
      )}
    </Card>
  );
}
