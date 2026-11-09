"use server";

import { eq, and, desc, ilike, gte, lte, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { checkInLogs, guests } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export interface CheckInLogEntry {
  id: string;
  guestName: string;
  action: string;
  performedBy: string | null;
  deviceInfo: string | null;
  invitationCode: string;
  checkedInAt: Date | null;
  syncedAt: Date | null;
  syncStatus: string | null;
  conflictResolution: string | null;
}

export interface CheckInLogsResult {
  logs: CheckInLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const viewerRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

/**
 * Fetch check-in audit logs dengan pagination dan filter.
 */
export async function getCheckInLogsAction(
  workspaceId: string,
  options?: {
    page?: number;
    pageSize?: number;
    search?: string;
    syncStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<CheckInLogsResult> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async () => {
      const db = getDb();
      const page = options?.page ?? 1;
      const pageSize = options?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;

      // Build where clauses untuk logs
      const logConditions = [eq(checkInLogs.workspaceId, workspaceId)];

      if (options?.syncStatus) {
        logConditions.push(eq(checkInLogs.syncStatus, options.syncStatus));
      }

      if (options?.dateFrom) {
        logConditions.push(gte(checkInLogs.checkedInAt, new Date(options.dateFrom)));
      }

      if (options?.dateTo) {
        const dateToEnd = new Date(options.dateTo);
        dateToEnd.setDate(dateToEnd.getDate() + 1);
        logConditions.push(lte(checkInLogs.checkedInAt, dateToEnd));
      }

      // Fetch logs dengan join ke guests untuk nama tamu
      const logs = await db
        .select({
          id: checkInLogs.id,
          guestName: guests.name,
          action: checkInLogs.action,
          performedBy: checkInLogs.performedBy,
          deviceInfo: checkInLogs.deviceInfo,
          invitationCode: checkInLogs.invitationCode,
          checkedInAt: checkInLogs.checkedInAt,
          syncedAt: checkInLogs.syncedAt,
          syncStatus: checkInLogs.syncStatus,
          conflictResolution: checkInLogs.conflictResolution,
        })
        .from(checkInLogs)
        .leftJoin(guests, eq(checkInLogs.guestId, guests.id))
        .where(and(...logConditions))
        .orderBy(desc(checkInLogs.checkedInAt))
        .limit(pageSize + 1)
        .offset(offset);

      // Filter by search di client side (karena join dengan guests)
      let filteredLogs = logs;
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        filteredLogs = logs.filter((log) =>
          (log.guestName || "").toLowerCase().includes(searchLower)
        );
      }

      // Hitung total untuk pagination
      const [{ total }] = await db
        .select({ total: count() })
        .from(checkInLogs)
        .where(and(...logConditions));

      const hasMore = filteredLogs.length > pageSize;
      const finalLogs = hasMore ? filteredLogs.slice(0, pageSize) : filteredLogs;

      return {
        logs: finalLogs as CheckInLogEntry[],
        total,
        page,
        pageSize,
        hasMore,
      };
    }
  );
}

/**
 * Export check-in logs ke CSV.
 */
export async function exportCheckInLogsAction(
  workspaceId: string
): Promise<string> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async () => {
      const db = getDb();

      const logs = await db
        .select({
          guestName: guests.name,
          action: checkInLogs.action,
          performedBy: checkInLogs.performedBy,
          deviceInfo: checkInLogs.deviceInfo,
          invitationCode: checkInLogs.invitationCode,
          checkedInAt: checkInLogs.checkedInAt,
          syncStatus: checkInLogs.syncStatus,
        })
        .from(checkInLogs)
        .leftJoin(guests, eq(checkInLogs.guestId, guests.id))
        .where(eq(checkInLogs.workspaceId, workspaceId))
        .orderBy(desc(checkInLogs.checkedInAt));

      // Generate CSV
      const headers = [
        "Nama Tamu",
        "Aksi",
        "Dilakukan Oleh",
        "Device",
        "Kode Undangan",
        "Waktu Check-in",
        "Status Sync",
      ];

      const rows = logs.map((log) => [
        log.guestName || "",
        log.action,
        log.performedBy || "",
        log.deviceInfo || "",
        log.invitationCode,
        log.checkedInAt ? new Date(log.checkedInAt).toLocaleString("id-ID") : "",
        log.syncStatus || "",
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      return csvContent;
    }
  );
}
