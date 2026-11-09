import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";

export const metadata = {
  title: "Analytics | Sewaka",
  description: "Dashboard analytics RSVP, budget, dan attendance",
};

export default async function AnalyticsPage() {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <AnalyticsDashboard workspaceId={workspace.id} />
    </div>
  );
}
