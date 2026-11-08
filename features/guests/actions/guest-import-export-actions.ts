"use server";

import { eq, and, sql, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { stripHtml } from "@/lib/utils/sanitization";
import { checkGuestLimit, requireFeature, SubscriptionLimitError } from "@/lib/utils/subscription-check";

/**
 * Import guests from CSV data (GST-03)
 * Sanitizes input to prevent CSV injection and XSS attacks
 */
export async function importGuestsAction(
  workspaceId: string,
  csvText: string,
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, imported: 0, errors: ["Unauthorized"] };
  }

  // Check feature access: import is premium only
  try {
    await requireFeature(workspaceId, "guest_import_export");
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      return { success: false, imported: 0, errors: [err.message] };
    }
  }

  const db = getDb();
  const errors: string[] = [];
  let imported = 0;

  try {
    // Parse CSV with proper handling of quoted fields
    // Auto-detect delimiter: semicolon (Excel Indonesia/Europe) or comma (US)
    const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (lines.length < 2) {
      return { success: false, imported: 0, errors: ["CSV harus memiliki header dan minimal 1 data"] };
    }

    // Detect delimiter from the first data line (skip header)
    const firstLine = lines[1] || "";
    const delimiter = firstLine.includes(";") ? ";" : ",";

    // Skip header row
    const dataLines = lines.slice(1);

    // Parse a CSV line respecting quoted fields and detected delimiter
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
          if (char === '"' && line[i + 1] === '"') {
            // Escaped quote
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === delimiter) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
      }
      result.push(current.trim());
      return result;
    };

    for (let i = 0; i < dataLines.length; i++) {
      // Check limit before each insert
      try {
        await checkGuestLimit(workspaceId);
      } catch (err) {
        if (err instanceof SubscriptionLimitError) {
          return { success: false, imported, errors: [err.message] };
        }
      }

      const columns = parseCsvLine(dataLines[i]);
      // Sanitize all inputs to prevent XSS and CSV injection
      const name = stripHtml(columns[0] || "");
      const email = stripHtml(columns[1] || "");
      const phone = stripHtml(columns[2] || "");
      const category = stripHtml(columns[3] || "");
      const side = stripHtml(columns[4] || "");

      if (!name) {
        errors.push(`Baris ${i + 2}: Nama tamu diperlukan`);
        continue;
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Baris ${i + 2}: Format email tidak valid`);
        continue;
      }

      try {
        await db.insert(guests).values({
          workspaceId,
          name,
          email: email || null,
          phone: phone || null,
          category: category || null,
          side: side || null,
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

  // Generate CSV with semicolon delimiter for Excel compatibility (Indonesia/Europe)
  const header = "Nama;Email;Telepon;Kategori;Pihak Mempelai;RSVP;Plus Ones";
  const rows = allGuests.map((g) =>
    [
      `"${(g.name ?? "").replace(/"/g, '""')}"`,
      `"${(g.email ?? "").replace(/"/g, '""')}"`,
      `"${(g.phone ?? "").replace(/"/g, '""')}"`,
      `"${(g.category ?? "").replace(/"/g, '""')}"`,
      `"${(g.side ?? "").replace(/"/g, '""')}"`,
      g.rsvpStatus,
      g.plusOnes,
    ].join(";"),
  );

  return [header, ...rows].join("\r\n");
}
