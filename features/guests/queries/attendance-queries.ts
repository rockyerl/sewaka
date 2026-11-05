import "server-only";

import { asc, eq } from "drizzle-orm";

import { withWorkspace } from "@/db/with-workspace";
import { guests } from "@/db/schema";

export type AttendanceStats = {
  totalGuests: number;
  accepted: number;
  declined: number;
  pending: number;
  checkedIn: number;
  byCategory: { category: string; total: number; checkedIn: number }[];
  recentCheckIns: {
    id: string;
    name: string;
    category: string | null;
    checkedInAt: Date | null;
  }[];
};

export async function getAttendanceReport(
  workspaceId: string,
  userId?: string,
): Promise<AttendanceStats> {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    const allGuests = await tx.select().from(guests).orderBy(asc(guests.name));

    const totalGuests = allGuests.length;
    const accepted = allGuests.filter((g) => g.rsvpStatus === "ACCEPTED").length;
    const declined = allGuests.filter((g) => g.rsvpStatus === "DECLINED").length;
    const pending = allGuests.filter((g) => g.rsvpStatus === "PENDING").length;
    const checkedIn = allGuests.filter((g) => g.checkedIn).length;

    // Group by category
    const categoryMap = new Map<string, { total: number; checkedIn: number }>();
    for (const guest of allGuests) {
      const cat = guest.category || "Tanpa Kategori";
      const existing = categoryMap.get(cat) || { total: 0, checkedIn: 0 };
      existing.total++;
      if (guest.checkedIn) existing.checkedIn++;
      categoryMap.set(cat, existing);
    }
    const byCategory = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({ category, ...data }),
    );

    // Recent check-ins (last 10)
    const recentCheckIns = allGuests
      .filter((g) => g.checkedIn)
      .sort((a, b) => {
        if (!a.checkedInAt) return 1;
        if (!b.checkedInAt) return -1;
        return b.checkedInAt.getTime() - a.checkedInAt.getTime();
      })
      .slice(0, 10)
      .map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        checkedInAt: g.checkedInAt,
      }));

    return { totalGuests, accepted, declined, pending, checkedIn, byCategory, recentCheckIns };
  });
}
