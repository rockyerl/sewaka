import { listWorkspaceGuests } from "@/features/guests/hooks/guest-queries";
import { GuestListView } from "@/features/guests/components/guest-list-view";

export const instant = false;

export default async function GuestsPage({
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

  const guests = await listWorkspaceGuests(workspace.id);

  return (
    <GuestListView
      workspaceId={workspace.id}
      invitationSlug={workspace.invitationSlug}
      guests={guests}
      canEdit={true}
      workspace={workspace}
    />
  );
}
