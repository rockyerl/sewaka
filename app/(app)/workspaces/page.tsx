import { auth } from "@/lib/actions/auth";
import { WorkspacesPageContent } from "@/features/workspaces/components/workspaces-page-content";

export const instant = false;

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getAllWorkspaces } = await import("@/lib/utils/workspace-cache");
  const session = await auth();
  const userId = session?.user?.id ?? "";
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
