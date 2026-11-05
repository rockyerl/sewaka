import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { weddingEvents } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

export const eventSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string(),
  eventDate: z.date().nullable(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WeddingEvent = z.infer<typeof eventSchema>;

export async function listWorkspaceEvents(workspaceId: string, userId?: string): Promise<WeddingEvent[]> {
  return withWorkspace(
    { workspaceId, userId },
    async (tx) => {
      const rows = await tx
        .select()
        .from(weddingEvents)
        .where(eq(weddingEvents.workspaceId, workspaceId))
        .orderBy(asc(weddingEvents.eventDate));

      return z.array(eventSchema).parse(rows);
    },
  );
}
