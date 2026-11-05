import { listMyWorkspaces } from "@/features/workspaces/queries";
import { listWorkspaceSeserahan } from "@/features/seserahan/queries/seserahan-queries";
import { SeserahanTrackerView } from "@/features/seserahan/components/seserahan-tracker-view";

export const instant = false;

export default async function SeserahanPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
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
