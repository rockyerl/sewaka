"use server";

import { eq, and, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Import guests from CSV data (GST-03)
 */
export async function importGuestsAction(
  workspaceId: string,
  csvText: string,
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, imported: 0, errors: ["Unauthorized"] };
  }

  const db = getDb();
  const errors: string[] = [];
  let imported = 0;

  try {
    // Parse CSV
    const lines = csvText.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.length < 2) {
      return { success: false, imported: 0, errors: ["CSV harus memiliki header dan minimal 1 data"] };
    }

    // Skip header row
    const dataLines = lines.slice(1);

    for (let i = 0; i < dataLines.length; i++) {
      const columns = dataLines[i].split(",").map((c) => c.trim());
      const name = columns[0];
      const email = columns[1] || null;
      const phone = columns[2] || null;
      const category = columns[3] || null;

      if (!name) {
        errors.push(`Baris ${i + 2}: Nama tamu diperlukan`);
        continue;
      }

      try {
        await db.insert(guests).values({
          workspaceId,
          name,
          email,
          phone,
          category,
        });
        imported++;
      } catch (error: any) {
        errors.push(`Baris ${i + 2}: ${error?.message || "Gagal menyimpan"}`);
      }
    }

    revalidatePath("/guests");
    return { success: true, imported, errors };
  } catch (error: any) {
    return { success: false, imported, errors: [error?.message || "Gagal import"] };
  }
}

/**
 * Export guests to CSV (GST-11)
 */
export async function exportGuestsAction(workspaceId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  const allGuests = await db
    .select()
    .from(guests)
    .where(eq(guests.workspaceId, workspaceId));

  // Generate CSV
  const header = "Nama,Email,Telepon,Kategori,RSVP,Plus Ones";
  const rows = allGuests.map((g) =>
    [
      `"${(g.name ?? "").replace(/"/g, '""')}"`,
      `"${(g.email ?? "").replace(/"/g, '""')}"`,
      `"${(g.phone ?? "").replace(/"/g, '""')}"`,
      `"${(g.category ?? "").replace(/"/g, '""')}"`,
      g.rsvpStatus,
      g.plusOnes,
    ].join(","),
  );

  return [header, ...rows].join("\n");
}
