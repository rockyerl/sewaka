import { connection } from "next/server";
import { AdminSettingsPageContent } from "@/features/admin/components/admin-settings-page-content";

export default async function SettingsPage() {
  await connection();
  return <AdminSettingsPageContent />;
}
