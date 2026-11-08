import { auth } from "@/lib/actions/auth";
import { getWhatsAppNotificationSettings } from "@/features/notifications/actions/whatsapp-notification-actions";
import { SettingsPageContent } from "@/features/settings/components/settings-page-content";

export const instant = false;

export default async function AccountSettingsPage() {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const session = await auth();
  if (!session?.user?.id) return null;

  const [whatsappSettings, workspace] = await Promise.all([
    getWhatsAppNotificationSettings(),
    getCurrentWorkspace(),
  ]);
  const workspaceId = workspace?.id ?? null;

  return (
    <SettingsPageContent
      userId={session.user.id}
      email={session.user.email ?? null}
      whatsappSettings={whatsappSettings}
      workspaceId={workspaceId}
    />
  );
}
