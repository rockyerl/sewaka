import { connection } from "next/server";
import { AdminSupportPageContent } from "@/features/admin/components/admin-support-page-content";

export default async function AdminSupportPage() {
  await connection();
  return <AdminSupportPageContent />;
}
