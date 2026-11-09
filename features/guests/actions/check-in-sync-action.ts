"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { guests, checkInLogs } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export interface CheckInQueueEntry {
  guestId: string;
  invitationCode: string;
  checkedInAt: string;
  deviceId: string;
  performedBy: string;
  timestamp: number;
}

export interface SyncResult {
  success: number;
  failed: number;
  conflicts: number;
  details: Array<{
    invitationCode: string;
    status: "success" | "conflict" | "failed";
    message?: string;
  }>;
}

/**
 * Batch sync offline check-ins to database
 * Idempotent: skip if guest already checked in, log as CONFLICT
 */
export async function batchSyncCheckIns(
  workspaceId: string,
  entries: CheckInQueueEntry[]
): Promise<SyncResult> {
  if (!workspaceId || !entries || entries.length === 0) {
    return {
      success: 0,
      failed: 0,
      conflicts: 0,
      details: [],
    };
  }

  const db = getDb();
  const result: SyncResult = {
    success: 0,
    failed: 0,
    conflicts: 0,
    details: [],
  };

  for (const entry of entries) {
    try {
      // Find guest by invitation code
      const [guest] = await db
        .select()
        .from(guests)
        .where(
          and(
            eq(guests.workspaceId, workspaceId),
            eq(guests.invitationCode, entry.invitationCode)
          )
        )
        .limit(1);

      if (!guest) {
        // Guest not found - try to find by guestId if provided
        if (entry.guestId) {
          const [guestById] = await db
            .select()
            .from(guests)
            .where(eq(guests.id, entry.guestId))
            .limit(1);

          if (guestById) {
            await processCheckIn(
              db,
              guestById,
              entry,
              workspaceId,
              result
            );
          } else {
            result.failed++;
            result.details.push({
              invitationCode: entry.invitationCode,
              status: "failed",
              message: "Guest not found",
            });
          }
        } else {
          result.failed++;
          result.details.push({
            invitationCode: entry.invitationCode,
            status: "failed",
            message: "Guest not found",
          });
        }
        continue;
      }

      await processCheckIn(db, guest, entry, workspaceId, result);
    } catch (error) {
      result.failed++;
      result.details.push({
        invitationCode: entry.invitationCode,
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  revalidatePath("/guests");
  return result;
}

async function processCheckIn(
  db: ReturnType<typeof getDb>,
  guest: any,
  entry: CheckInQueueEntry,
  workspaceId: string,
  result: SyncResult
) {
  // Check if already checked in (idempotent)
  if (guest.checkedIn) {
    // Log as CONFLICT
    await db.insert(checkInLogs).values({
      guestId: guest.id,
      workspaceId,
      action: "CONFLICT",
      performedBy: entry.performedBy,
      deviceInfo: entry.deviceId,
      invitationCode: entry.invitationCode,
      checkedInAt: new Date(entry.checkedInAt),
      syncStatus: "CONFLICT",
      conflictResolution: "Already checked in at " + new Date(guest.checkedInAt).toISOString(),
      metadata: {
        offlineTimestamp: entry.timestamp,
        originalCheckedInAt: guest.checkedInAt,
      },
    });

    result.conflicts++;
    result.details.push({
      invitationCode: entry.invitationCode,
      status: "conflict",
      message: "Already checked in",
    });
    return;
  }

  // Mark as checked in
  await db
    .update(guests)
    .set({
      checkedIn: true,
      checkedInAt: new Date(entry.checkedInAt),
      checkedInBy: entry.performedBy,
      checkedInDevice: entry.deviceId,
    })
    .where(eq(guests.id, guest.id));

  // Log successful sync
  await db.insert(checkInLogs).values({
    guestId: guest.id,
    workspaceId,
    action: "SYNC_SUCCESS",
    performedBy: entry.performedBy,
    deviceInfo: entry.deviceId,
    invitationCode: entry.invitationCode,
    checkedInAt: new Date(entry.checkedInAt),
    syncedAt: new Date(),
    syncStatus: "SYNCED",
    metadata: {
      offlineTimestamp: entry.timestamp,
      guestName: guest.name,
    },
  });

  result.success++;
  result.details.push({
    invitationCode: entry.invitationCode,
    status: "success",
  });
}
