import { CommandCenterPage } from "@/features/command-center/components/command-center-page";

export const instant = false;

export default async function CommandCenterRoute() {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return <CommandCenterPage workspaceId={workspace.id} />;
}
