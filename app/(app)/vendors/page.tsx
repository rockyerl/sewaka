import { VendorsPageContent } from "@/features/vendors/components/vendors-page-content";
import { connection } from "next/server";

export const instant = false;

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string; tab?: string }>;
}) {
  await connection();
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const activeTab = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { tab?: string }).tab || "my_vendors"
    : "my_vendors";

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  return <VendorsPageContent workspaceId={workspace.id} activeTab={activeTab} />;
}
