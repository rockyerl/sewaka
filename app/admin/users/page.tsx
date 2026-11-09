import { connection } from "next/server";
import { AdminUsersPageContent } from "@/features/admin/components/admin-users-page-content";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  await connection();
  const resolved = await (searchParams ?? Promise.resolve({}));
  const search = typeof resolved === "object" && resolved !== null ? (resolved as { search?: string }).search : undefined;
  const page = Number((typeof resolved === "object" && resolved !== null ? (resolved as { page?: string }).page : undefined) ?? 1);

  return <AdminUsersPageContent search={search} page={page} />;
}
