"use server";

import "server-only";
import { and, eq } from "drizzle-orm";
import { calendarSyncs, weddingEvents } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { googleCalendarApiUrl, googleOAuthEndpoint } from "@/features/calendar/lib/oauth";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

async function refreshAccessToken(config: {
  id: string; workspaceId: string; userId: string; accessToken: string;
  refreshToken: string | null; tokenExpiresAt: Date | null;
}) {
  if (config.tokenExpiresAt && config.tokenExpiresAt.getTime() > Date.now() + 60_000) {
    return config.accessToken;
  }
  if (!config.refreshToken) throw new Error("Google Calendar access expired. Reconnect the calendar.");

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured");

  const response = await fetch(googleOAuthEndpoint("token"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    await withWorkspace({ workspaceId: config.workspaceId, userId: config.userId }, (tx) =>
      tx.update(calendarSyncs).set({ isActive: false }).where(eq(calendarSyncs.id, config.id)),
    );
    throw new Error("Google Calendar authorization expired. Reconnect the calendar.");
  }

  const token = await response.json() as { access_token: string; expires_in: number };
  await withWorkspace({ workspaceId: config.workspaceId, userId: config.userId }, (tx) =>
    tx.update(calendarSyncs).set({
      accessToken: token.access_token,
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
      updatedAt: new Date(),
    }).where(eq(calendarSyncs.id, config.id)),
  );
  return token.access_token;
}

async function calendarRequest(
  token: string,
  calendarId: string,
  path: string,
  init?: RequestInit,
) {
  return fetch(
    googleCalendarApiUrl(`calendars/${encodeURIComponent(calendarId)}/${path}`),
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    },
  );
}

export async function disconnectGoogleCalendar(workspaceId: string) {
  const user = await requireUser();
  const [config] = await withWorkspace(
    { workspaceId, userId: user.id, allowedRoles: ["OWNER", "PARTNER"] },
    (tx) => tx.select().from(calendarSyncs).where(and(
      eq(calendarSyncs.userId, user.id),
      eq(calendarSyncs.workspaceId, workspaceId),
      eq(calendarSyncs.provider, "GOOGLE"),
    )).limit(1),
  );

  await withWorkspace(
    { workspaceId, userId: user.id, allowedRoles: ["OWNER", "PARTNER"] },
    (tx) => tx.delete(calendarSyncs).where(and(
      eq(calendarSyncs.userId, user.id),
      eq(calendarSyncs.workspaceId, workspaceId),
      eq(calendarSyncs.provider, "GOOGLE"),
    )),
  );

  if (config?.refreshToken) {
    try {
      await fetch(googleOAuthEndpoint("revoke"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: config.refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Local credentials are removed even when Google's revocation endpoint is unavailable.
    }
  }

  revalidatePath("/settings");
  return { success: true };
}

/** Sync wedding event CRUD changes to the connected Google calendar. */
export async function syncEventsToCalendar(workspaceId: string): Promise<{ success: true; syncedEvents: number; deletedEvents: number }> {
  const user = await requireUser();
  const { config, events } = await withWorkspace(
    { workspaceId, userId: user.id, allowedRoles: ["OWNER", "PARTNER"] },
    async (tx) => {
      const [syncConfig] = await tx.select().from(calendarSyncs).where(and(
        eq(calendarSyncs.userId, user.id),
        eq(calendarSyncs.workspaceId, workspaceId),
        eq(calendarSyncs.provider, "GOOGLE"),
        eq(calendarSyncs.isActive, true),
      )).limit(1);
      const rows = await tx.select().from(weddingEvents).where(eq(weddingEvents.workspaceId, workspaceId));
      return { config: syncConfig, events: rows };
    },
  );
  if (!config) throw new Error("No active Google Calendar connection found");

  const token = await refreshAccessToken(config);
  const currentEvents = events.filter((event) => event.eventDate);
  const currentIds = new Set(currentEvents.map((event) => event.id));
  const listUrl = new URL(googleCalendarApiUrl(`calendars/${encodeURIComponent(config.calendarId)}/events`));
  listUrl.searchParams.set("maxResults", "2500");
  listUrl.searchParams.set("privateExtendedProperty", `sewakaWorkspaceId=${workspaceId}`);

  const listResponse = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!listResponse.ok) throw new Error(`Could not read Google Calendar events (${listResponse.status})`);
  const listed = await listResponse.json() as {
    items?: Array<{ id: string; extendedProperties?: { private?: Record<string, string> } }>;
    nextPageToken?: string;
  };
  if (listed.nextPageToken) throw new Error("Calendar has more than 2500 Sewaka events; sync was stopped safely");

  let deletedEvents = 0;
  for (const item of listed.items ?? []) {
    const sourceId = item.extendedProperties?.private?.sewakaEventId;
    if (sourceId && !currentIds.has(sourceId)) {
      const response = await calendarRequest(token, config.calendarId, `events/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Could not remove deleted Sewaka event (${response.status})`);
      }
      deletedEvents += 1;
    }
  }

  for (const event of currentEvents) {
    const eventId = Buffer.from(event.id.replaceAll("-", "").toLowerCase(), "hex").toString("hex").slice(0, 40);
    const resource = {
      id: eventId,
      summary: event.name,
      description: event.notes ?? undefined,
      location: event.location ?? undefined,
      start: { dateTime: event.eventDate!.toISOString(), timeZone: "Asia/Jakarta" },
      end: { dateTime: new Date(event.eventDate!.getTime() + 60 * 60 * 1000).toISOString(), timeZone: "Asia/Jakarta" },
      extendedProperties: { private: { sewakaWorkspaceId: workspaceId, sewakaEventId: event.id } },
    };
    const existing = await calendarRequest(token, config.calendarId, `events/${eventId}`);
    if (existing.ok) {
      const updated = await calendarRequest(token, config.calendarId, `events/${eventId}`, {
        method: "PUT", body: JSON.stringify(resource),
      });
      if (!updated.ok) throw new Error(`Could not update calendar event (${updated.status})`);
    } else if (existing.status === 404) {
      const created = await calendarRequest(token, config.calendarId, "events", {
        method: "POST", body: JSON.stringify(resource),
      });
      if (!created.ok) throw new Error(`Could not create calendar event (${created.status})`);
    } else {
      throw new Error(`Could not check calendar event (${existing.status})`);
    }
  }

  await withWorkspace({ workspaceId, userId: user.id, allowedRoles: ["OWNER", "PARTNER"] }, (tx) =>
    tx.update(calendarSyncs).set({ lastSyncAt: new Date() }).where(eq(calendarSyncs.id, config.id)),
  );
  revalidatePath("/settings");
  return { success: true, syncedEvents: currentEvents.length, deletedEvents };
}

export async function getCalendarSyncStatus(workspaceId: string) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) return { isConnected: false, provider: null, lastSyncAt: null };

  const [syncConfig] = await withWorkspace({ workspaceId, userId: sessionUser.user.id }, (tx) => tx
    .select({
      provider: calendarSyncs.provider,
      calendarId: calendarSyncs.calendarId,
      syncDirection: calendarSyncs.syncDirection,
      lastSyncAt: calendarSyncs.lastSyncAt,
    })
    .from(calendarSyncs)
    .where(and(
      eq(calendarSyncs.userId, sessionUser.user.id),
      eq(calendarSyncs.workspaceId, workspaceId),
      eq(calendarSyncs.isActive, true),
    ))
    .limit(1));

  return syncConfig
    ? { isConnected: true, ...syncConfig }
    : { isConnected: false, provider: null, lastSyncAt: null };
}
