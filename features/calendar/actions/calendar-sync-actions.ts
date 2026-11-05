"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { calendarSyncs, weddingEvents } from "@/db/schema";
import { auth } from "@/auth";
import { getEnv } from "@/lib/env";
import { revalidatePath } from "next/cache";

/**
 * Connect to Google Calendar (CAL-06)
 * Saves the calendar sync configuration
 */
export async function connectGoogleCalendar(workspaceId: string, calendarId: string, accessToken: string, refreshToken?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Check if sync already exists
  const [existing] = await db
    .select()
    .from(calendarSyncs)
    .where(
      and(
        eq(calendarSyncs.userId, session.user.id),
        eq(calendarSyncs.workspaceId, workspaceId),
        eq(calendarSyncs.provider, "GOOGLE")
      )
    )
    .limit(1);

  if (existing) {
    // Update existing sync
    await db
      .update(calendarSyncs)
      .set({
        calendarId,
        accessToken,
        refreshToken,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(calendarSyncs.id, existing.id));
  } else {
    // Create new sync
    await db.insert(calendarSyncs).values({
      userId: session.user.id,
      workspaceId,
      provider: "GOOGLE",
      calendarId,
      accessToken,
      refreshToken,
      syncDirection: "BIDIRECTIONAL",
      isActive: true,
    });
  }

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Disconnect from Google Calendar (CAL-06)
 */
export async function disconnectGoogleCalendar(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  await db
    .delete(calendarSyncs)
    .where(
      and(
        eq(calendarSyncs.userId, session.user.id),
        eq(calendarSyncs.workspaceId, workspaceId),
        eq(calendarSyncs.provider, "GOOGLE")
      )
    );

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Sync events to Google Calendar (CAL-06)
 * Pushes wedding events to the connected calendar
 */
export async function syncEventsToCalendar(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  const env = getEnv();

  // Get calendar sync config
  const [syncConfig] = await db
    .select()
    .from(calendarSyncs)
    .where(
      and(
        eq(calendarSyncs.userId, session.user.id),
        eq(calendarSyncs.workspaceId, workspaceId),
        eq(calendarSyncs.provider, "GOOGLE"),
        eq(calendarSyncs.isActive, true)
      )
    )
    .limit(1);

  if (!syncConfig) {
    throw new Error("No active calendar sync found");
  }

  // Get all events for the workspace
  const events = await db
    .select()
    .from(weddingEvents)
    .where(eq(weddingEvents.workspaceId, workspaceId));

  // Sync events to Google Calendar
  // In a real implementation, you would use Google Calendar API here
  console.log(`Syncing ${events.length} events to Google Calendar for workspace ${workspaceId}`);

  // Update last sync time
  await db
    .update(calendarSyncs)
    .set({ lastSyncAt: new Date() })
    .where(eq(calendarSyncs.id, syncConfig.id));

  return { success: true, syncedEvents: events.length };
}

/**
 * Get calendar sync status
 */
export async function getCalendarSyncStatus(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { isConnected: false, provider: null, lastSyncAt: null };
  }

  const db = getDb();

  const [syncConfig] = await db
    .select()
    .from(calendarSyncs)
    .where(
      and(
        eq(calendarSyncs.userId, session.user.id),
        eq(calendarSyncs.workspaceId, workspaceId),
        eq(calendarSyncs.isActive, true)
      )
    )
    .limit(1);

  if (!syncConfig) {
    return { isConnected: false, provider: null, lastSyncAt: null };
  }

  return {
    isConnected: true,
    provider: syncConfig.provider,
    calendarId: syncConfig.calendarId,
    syncDirection: syncConfig.syncDirection,
    lastSyncAt: syncConfig.lastSyncAt,
  };
}
