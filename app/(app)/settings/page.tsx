import { getCurrentUser } from "@/lib/auth-cache";
import { getWhatsAppNotificationSettings } from "@/features/notifications/actions/whatsapp-notification-actions";
import { SettingsPageContent } from "@/features/settings/components/settings-page-content";
import { connection } from "next/server";

export const instant = false;

export default async function AccountSettingsPage() {
  await connection();
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return null;

  const [whatsappSettings, workspace] = await Promise.all([
    getWhatsAppNotificationSettings(),
    getCurrentWorkspace(),
  ]);
  const workspaceId = workspace?.id ?? null;

  return (
    <SettingsPageContent
      userId={sessionUser.id}
      email={sessionUser.email}
      whatsappSettings={whatsappSettings}
      workspaceId={workspaceId}
    />
  );
}
