import { getActivePlans } from "@/features/subscription/queries/subscription-plan-queries";
import { SubscriptionPageClient } from "./subscription-page-client";

export const instant = false;

export default async function SubscriptionPage() {
  const { getAllWorkspaces } = await import("@/lib/workspace-cache");
  const [workspaces, plans] = await Promise.all([
    getAllWorkspaces(),
    getActivePlans(),
  ]);
  return <SubscriptionPageClient initialWorkspaces={workspaces} initialPlans={plans} />;
}
