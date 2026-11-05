import { desc, eq, and, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { guests, weddingEvents, weddingWorkspaces } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";
import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
} from "@/lib/cultural-templates";

export const guestSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  category: z.string().nullable(),
  rsvpStatus: z.enum(["PENDING", "ACCEPTED", "DECLINED"]),
  plusOnes: z.number().int(),
  invitationCode: z.string().nullable().optional(),
  wishes: z.string().nullable().optional(),
  checkedIn: z.boolean().default(false),
  checkedInAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Guest = z.infer<typeof guestSchema>;

export async function listWorkspaceGuests(
  workspaceId: string,
  userId?: string,
): Promise<Guest[]> {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    const rows = await tx
      .select()
      .from(guests)
      .where(eq(guests.workspaceId, workspaceId))
      .orderBy(desc(guests.createdAt));

    return z.array(guestSchema).parse(rows);
  });
}

/**
 * Public Invitation Query: Accessible by guests without login
 */
export async function getPublicInvitationBySlug(slug: string) {
  const db = getDb();

  const [workspace] = await db
    .select({
      id: weddingWorkspaces.id,
      name: weddingWorkspaces.name,
      coupleOne: weddingWorkspaces.coupleOne,
      coupleTwo: weddingWorkspaces.coupleTwo,
      weddingDate: weddingWorkspaces.weddingDate,
      location: weddingWorkspaces.location,
      culturalTradition: weddingWorkspaces.culturalTradition,
      invitationSlug: weddingWorkspaces.invitationSlug,
      invitationQuote: weddingWorkspaces.invitationQuote,
      dressCode: weddingWorkspaces.dressCode,
      story: weddingWorkspaces.story,
    })
    .from(weddingWorkspaces)
    .where(eq(weddingWorkspaces.invitationSlug, slug))
    .limit(1);

  if (!workspace) {
    return null;
  }

  const events = await db
    .select({
      id: weddingEvents.id,
      name: weddingEvents.name,
      eventDate: weddingEvents.eventDate,
      location: weddingEvents.location,
      notes: weddingEvents.notes,
    })
    .from(weddingEvents)
    .where(eq(weddingEvents.workspaceId, workspace.id))
    .orderBy(weddingEvents.eventDate);

  const publicWishes = await db
    .select({
      id: guests.id,
      name: guests.name,
      wishes: guests.wishes,
      createdAt: guests.createdAt,
    })
    .from(guests)
    .where(
      and(
        eq(guests.workspaceId, workspace.id),
        sql`${guests.wishes} is not null and ${guests.wishes} != ''`,
      ),
    )
    .orderBy(desc(guests.createdAt))
    .limit(30);

  const tradition = (workspace.culturalTradition ?? "JAWA") as CulturalTradition;
  const traditionInfo = CULTURAL_TRADITIONS[tradition] ?? CULTURAL_TRADITIONS.JAWA;

  return {
    workspace,
    events,
    publicWishes,
    traditionInfo,
  };
}
