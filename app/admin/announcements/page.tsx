import { connection } from "next/server";
import { getAnnouncements } from "@/features/admin/actions/admin-feature-actions";
import AnnouncementsClient from "@/features/admin/components/announcements-client";

export default async function AnnouncementsPage() {
  await connection();
  const announcements = await getAnnouncements();
  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
