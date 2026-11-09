import { CulturalWorkflowGenerator } from "@/features/cultural-workflow/components/cultural-workflow-generator";

export const instant = false;

export default async function CulturalWorkflowPage({
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

  return (
    <CulturalWorkflowGenerator
      workspaceId={workspace.id}
      userTradition={workspace.culturalTradition}
    />
  );
}
