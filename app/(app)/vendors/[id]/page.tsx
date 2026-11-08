import { notFound } from "next/navigation";
import { VendorDetailPageContent } from "@/features/vendors/components/vendor-detail-page-content";

export const instant = false;

export default async function VendorPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({ workspaceId: undefined }));
  const workspaceId = (resolvedSearchParams as any).workspaceId;

  if (!workspaceId) notFound();

  return <VendorDetailPageContent vendorId={resolvedParams.id} workspaceId={workspaceId} />;
}
