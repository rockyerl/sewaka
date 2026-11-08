import { listWorkspaceSeserahan } from "@/features/seserahan/hooks/seserahan-queries";
import { SeserahanTrackerView } from "@/features/seserahan/components/seserahan-tracker-view";

export const instant = false;

export default async function SeserahanPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  const items = await listWorkspaceSeserahan(workspace.id);

  return (
    <SeserahanTrackerView
      workspaceId={workspace.id}
      items={items}
      canEdit={true}
    />
  );
}
