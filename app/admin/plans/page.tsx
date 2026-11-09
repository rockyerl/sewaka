import { connection } from "next/server";
import { AdminPlansPageContent } from "@/features/admin/components/admin-plans-page-content";

export default async function AdminPlansPage() {
  await connection();
  return <AdminPlansPageContent />;
}
