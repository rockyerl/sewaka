import { Suspense } from "react";
import { SummaryPage } from "@/features/summary/components/summary-page";

export const metadata = {
  title: "Executive Summary",
  description: "Download laporan ringkasan pernikahan",
};

export default async function SummaryRoutePage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SummaryPage workspaceId={workspace.id} />
    </Suspense>
  );
}
