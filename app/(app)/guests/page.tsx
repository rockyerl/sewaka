import { listWorkspaceGuests } from "@/features/guests/queries";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import { GuestListView } from "@/features/guests/components/guest-list-view";

export const instant = false;

export default async function GuestsPage({
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
