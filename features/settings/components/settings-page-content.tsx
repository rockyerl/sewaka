import { AlertTriangle, LogOut, Shield } from "lucide-react";

import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-components";
import { SubmitOutline } from "@/components/ui/submit-button";

import { deactivateAccountAction } from "@/features/auth/actions/account-actions";
import { signOutAction } from "@/features/auth/actions/auth-actions";
import { PushNotificationSettings } from "@/features/notifications/components/push-notification-settings";
import { WhatsAppNotificationSettings } from "@/features/notifications/components/whatsapp-notification-settings";
import { CalendarSyncSettings } from "@/features/calendar/components/calendar-sync-settings";

export async function SettingsPageContent({
  userId,
  email,
  whatsappSettings,
  workspaceId,
}: {
  userId: string;
  email: string | null;
  whatsappSettings: any;
  workspaceId: string | null;
}) {
  return (
    <>
      <PageHeader
        eyebrow="PENGATURAN AKUN"
        title="Akun Saya"
        description="Kelola pengaturan akun, notifikasi, dan keamanan."
      />

      {/* Profile Info */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-muted-foreground" />
          <h2 className="font-serif text-lg font-medium">Informasi Akun</h2>
        </div>
        <div className="rounded-lg border border-border/60 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{email ?? "Tidak tersedia"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Akun ID</span>
              <span className="font-mono text-xs text-muted-foreground">{userId.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <PushNotificationSettings />

      {/* WhatsApp Notifications */}
      <div className="my-6">
        <WhatsAppNotificationSettings initialSettings={whatsappSettings} />
      </div>

      {/* Calendar Sync */}
      {workspaceId && (
        <div className="my-6">
          <CalendarSyncSettings workspaceId={workspaceId} />
        </div>
      )}

      {/* Sign Out */}
      <Card className="mb-6 gap-4 rounded-xl border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <LogOut className="size-5 text-muted-foreground" />
          <h2 className="font-serif text-lg font-medium">Sesi</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Keluar dari akun kamu di perangkat ini.
        </p>
        <form action={signOutAction}>
          <SubmitOutline>
            <LogOut className="size-3.5 mr-1" />
            Keluar
          </SubmitOutline>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="mb-6 gap-5 rounded-xl border-[#f4e9e9] bg-[#fffafa] p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-[#9b4a4a]" />
          <h2 className="font-serif text-lg font-medium text-[#9b4a4a]">Zona Bahaya</h2>
        </div>
        <div className="rounded-lg border border-[#f4e9e9]/80 bg-[#f4e9e9]/30 p-4">
          <h3 className="text-sm font-medium text-[#9b4a4a]">Nonaktifkan Akun</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Menonaktifkan akun akan menghapus data pribadi kamu dan membuat akun tidak dapat diakses.
            Semua workspace yang kamu miliki akan terpengaruh. Tindakan ini tidak dapat dibatalkan.
          </p>
          <form action={deactivateAccountAction} className="mt-3">
            <ConfirmSubmitButton
              confirmMessage="Apakah kamu yakin ingin menonaktifkan akun? Tindakan ini tidak dapat dibatalkan."
              aria-label="Nonaktifkan Akun"
              className="gap-2 rounded-lg bg-[#9b4a4a] px-4 text-xs text-white hover:bg-[#9b4a4a]/90"
            >
              <AlertTriangle className="size-4" /> Nonaktifkan Akun
            </ConfirmSubmitButton>
          </form>
        </div>
      </Card>
    </>
  );
}
