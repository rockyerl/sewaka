"use client";

import { useState } from "react";
import { connectGoogleCalendar, disconnectGoogleCalendar, syncEventsToCalendar, getCalendarSyncStatus } from "@/features/calendar/actions/calendar-sync-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { formatDateIndonesia } from "@/components/ui/date-badge";
import { showToast } from "@/components/ui/toast";

interface CalendarSyncSettingsProps {
  workspaceId: string;
}

export function CalendarSyncSettings({ workspaceId }: CalendarSyncSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would redirect to Google OAuth
      // For now, we just simulate the connection
      await connectGoogleCalendar(
        workspaceId,
        "primary",
        "dummy_token", // This would be the actual access token from OAuth
        "dummy_refresh_token"
      );
      setIsConnected(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);

    try {
      await disconnectGoogleCalendar(workspaceId);
      setIsConnected(false);
      setLastSyncAt(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const result = await syncEventsToCalendar(workspaceId);
      setLastSyncAt(new Date());
      showToast(`Berhasil menyinkronkan ${result.syncedEvents} acara!`, "success");
    } catch (err) {
      setError(String(err));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sinkronisasi Kalender
        </CardTitle>
        <CardDescription>
          Hubungkan dengan Google Calendar untuk sinkronisasi acara
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Terhubung ke Google Calendar" : "Tidak terhubung"}
            </p>
          </div>
          {isConnected ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Terhubung
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Tidak terhubung
            </Badge>
          )}
        </div>

        {lastSyncAt && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Terakhir disinkronkan: {formatDateIndonesia(lastSyncAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isConnected ? (
          <div className="space-y-2">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className="w-full"
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Menyinkronkan...
                </>
              ) : (
                "Sinkronkan Sekarang"
              )}
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? "Memproses..." : "Putuskan Hubungan"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Hubungkan Google Calendar"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
