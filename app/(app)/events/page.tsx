import { UnifiedEventsPage } from "@/features/events/components/unified-events-page";

export const instant = false;

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string; date?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string; date?: string }).workspaceId
      : undefined;
  const dateFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string; date?: string }).date
      : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  return <UnifiedEventsPage workspaceId={workspace.id} initialDate={dateFromQuery} />;
}
