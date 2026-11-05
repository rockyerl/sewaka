"use client";

import { useEffect, useState } from "react";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/features/notifications/actions/push-notification-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, XCircle } from "lucide-react";

export function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
      });

      // Save subscription to database
      await subscribeToPushNotifications({
        endpoint: subscription.endpoint,
        p256dh: btoa(
          Array.from(new Uint8Array(subscription.getKey("p256dh")!)).map((c) => String.fromCharCode(c)).join("")
        ),
        auth: btoa(
          Array.from(new Uint8Array(subscription.getKey("auth")!)).map((c) => String.fromCharCode(c)).join("")
        ),
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribeFromPushNotifications(subscription.endpoint);
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notification
          </CardTitle>
          <CardDescription>
            Browser Anda tidak mendukung push notification
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification
        </CardTitle>
        <CardDescription>
          Terima notifikasi langsung di browser Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? "Aktif" : "Tidak aktif"}
            </p>
          </div>
          {isSubscribed ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Aktif
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Tidak aktif
            </Badge>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isSubscribed ? (
          <Button
            onClick={handleUnsubscribe}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Memproses..." : "Nonaktifkan Push Notification"}
          </Button>
        ) : (
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Memproses..." : "Aktifkan Push Notification"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
