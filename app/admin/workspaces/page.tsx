import { AdminWorkspacesPageContent } from "@/features/admin/components/admin-workspaces-page-content";

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const resolved = await (searchParams ?? Promise.resolve({}));
  const search = typeof resolved === "object" && resolved !== null ? (resolved as { search?: string }).search : undefined;
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  return <AdminWorkspacesPageContent search={search} page={page} />;
}
