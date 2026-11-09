import { WhatsAppRSVPDashboard } from "@/features/whatsapp-rsvp/components/whatsapp-rsvp-dashboard";

export const instant = false;

export default async function WhatsAppRSVPPage() {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return <WhatsAppRSVPDashboard workspaceId={workspace.id} />;
}
