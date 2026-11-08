import { AdminPaymentsPageContent } from "@/features/admin/components/admin-payments-page-content";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const status = typeof resolved === "object" && resolved !== null ? (resolved as { status?: string }).status : undefined;
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  return <AdminPaymentsPageContent status={status} page={page} />;
}
