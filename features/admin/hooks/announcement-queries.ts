"use cache";

import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { announcements } from "@/lib/db/schema";

export async function getActiveAnnouncements() {
  const db = getDb();
  const now = new Date();
  const items = await db.select().from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt));
  
  return items.filter(a => {
    if (a.startDate && a.startDate > now) return false;
    if (a.endDate && a.endDate < now) return false;
    return true;
  });
}
