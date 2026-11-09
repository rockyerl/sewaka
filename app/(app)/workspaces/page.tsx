import { getCurrentUser } from "@/lib/auth-cache";
import { WorkspacesPageContent } from "@/features/workspaces/components/workspaces-page-content";

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getAllWorkspaces } = await import("@/lib/utils/workspace-cache");
  const sessionUser = await getCurrentUser();
  const userId = sessionUser?.id ?? "";
  const workspaces = await getAllWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const currentWorkspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];

  return (
    <WorkspacesPageContent
      workspaces={workspaces}
      currentWorkspaceId={currentWorkspace?.id ?? ""}
      currentUserId={userId}
    />
  );
}
