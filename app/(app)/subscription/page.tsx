import { listMyWorkspaces } from "@/features/workspaces/queries";
import { getActivePlans } from "@/features/subscription/queries/subscription-plan-queries";
import { SubscriptionPageClient } from "./subscription-page-client";

export const instant = false;

export default async function SubscriptionPage() {
  const [workspaces, plans] = await Promise.all([
    listMyWorkspaces(),
    getActivePlans(),
  ]);
  return <SubscriptionPageClient initialWorkspaces={workspaces} initialPlans={plans} />;
}
