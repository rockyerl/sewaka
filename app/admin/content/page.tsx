import { connection } from "next/server";
import { AdminContentPageContent } from "@/features/admin/components/admin-content-page-content";

export default async function AdminContentPage() {
  await connection();
  return <AdminContentPageContent />;
}
