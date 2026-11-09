import { SeatingPlannerPage } from "@/features/seating-planner/components/seating-planner-page";

export const instant = false;

export default async function SeatingPlannerRoute() {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return <SeatingPlannerPage workspaceId={workspace.id} />;
}
