import { AdminLogsPageContent } from "@/features/admin/components/admin-logs-page-content";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  return <AdminLogsPageContent page={page} />;
}
