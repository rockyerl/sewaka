import { getAnnouncements } from "@/features/admin/actions/admin-feature-actions";
import AnnouncementsClient from "./announcements-client";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();
  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
