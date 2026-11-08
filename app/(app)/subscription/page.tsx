import { getActivePlans } from "@/features/subscription/hooks/subscription-plan-queries";
import { SubscriptionPageClient } from "@/features/subscription/components/subscription-page-client";

export const instant = false;

export default async function SubscriptionPage() {
  const { getAllWorkspaces } = await import("@/lib/utils/workspace-cache");
  const [workspaces, plans] = await Promise.all([
    getAllWorkspaces(),
    getActivePlans(),
  ]);
  return <SubscriptionPageClient initialWorkspaces={workspaces} initialPlans={plans} />;
}
