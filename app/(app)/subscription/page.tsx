import { listMyWorkspaces } from "@/features/workspaces/queries";
import { SubscriptionPageClient } from "./subscription-page-client";

export default async function SubscriptionPage() {
  const workspaces = await listMyWorkspaces();
  return <SubscriptionPageClient initialWorkspaces={workspaces} />;
}
