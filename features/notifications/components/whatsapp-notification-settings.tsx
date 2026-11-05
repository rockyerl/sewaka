"use client";

import { useState } from "react";
import { updateWhatsAppNotificationSettings, getWhatsAppNotificationSettings } from "@/features/notifications/actions/whatsapp-notification-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Loader2, CheckCircle2 } from "lucide-react";

interface WhatsAppNotificationSettingsProps {
  initialSettings?: {
    phoneNumber: string;
    isEnabled: boolean;
    taskReminders: boolean;
    budgetAlerts: boolean;
    eventReminders: boolean;
  } | null;
}

export function WhatsAppNotificationSettings({ initialSettings }: WhatsAppNotificationSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [phoneNumber, setPhoneNumber] = useState(initialSettings?.phoneNumber || "");
  const [isEnabled, setIsEnabled] = useState(initialSettings?.isEnabled || false);
  const [taskReminders, setTaskReminders] = useState<boolean>(initialSettings?.taskReminders ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState<boolean>(initialSettings?.budgetAlerts ?? true);
  const [eventReminders, setEventReminders] = useState<boolean>(initialSettings?.eventReminders ?? true);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateWhatsAppNotificationSettings({
        phoneNumber,
        isEnabled,
        taskReminders,
        budgetAlerts,
        eventReminders,
      });
      setSuccess(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Notifikasi WhatsApp
        </CardTitle>
        <CardDescription>
          Terima notifikasi langsung di WhatsApp Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone-number">Nomor WhatsApp</Label>
          <Input
            id="phone-number"
            type="tel"
            placeholder="+62 812 3456 7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!isEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Aktifkan WhatsApp</p>
            <p className="text-sm text-muted-foreground">
              Aktifkan notifikasi WhatsApp
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        {isEnabled && (
          <div className="space-y-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pengingat Tugas</p>
                <p className="text-xs text-muted-foreground">
                  Notifikasi sebelum deadline tugas
                </p>
              </div>
              <Switch
                checked={taskReminders}
                onCheckedChange={setTaskReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alert Anggaran</p>
                <p className="text-xs text-muted-foreground">
                  Notifikasi saat anggaran hampir habis
                </p>
              </div>
              <Switch
                checked={budgetAlerts}
                onCheckedChange={setBudgetAlerts}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pengingat Acara</p>
                <p className="text-xs text-muted-foreground">
                  Notifikasi sebelum acara pernikahan
                </p>
              </div>
              <Switch
                checked={eventReminders}
                onCheckedChange={setEventReminders}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-[#D4AF37]/10 p-3 text-sm text-[#5B132B]">
            <CheckCircle2 className="h-4 w-4" />
            Pengaturan berhasil disimpan!
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={loading || !phoneNumber}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Pengaturan"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
