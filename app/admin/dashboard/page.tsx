import { connection } from "next/server";
import { AdminDashboardPageContent } from "@/features/admin/components/admin-dashboard-page-content";

export default async function AdminDashboardPage() {
  await connection();
  return <AdminDashboardPageContent />;
}
