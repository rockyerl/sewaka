import { AdminAuditTrailPageContent } from "@/features/admin/components/admin-audit-trail-page-content";

export default async function AuditTrailPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const params = await searchParams;
  return (
    <AdminAuditTrailPageContent
      action={params.action}
      entity={params.entity}
      page={Number(params.page) || 1}
    />
  );
}
