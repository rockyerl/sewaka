import { connection } from "next/server";
import { AdminAuditTrailPageContent } from "@/features/admin/components/admin-audit-trail-page-content";

export default async function AuditTrailPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  await connection();
  const params = await searchParams;
  return (
    <AdminAuditTrailPageContent
      action={params.action}
      entity={params.entity}
      page={Number(params.page) || 1}
    />
  );
}
