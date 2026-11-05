"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { weddingEvents } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

import { createEventSchema, deleteEventSchema } from "../schemas/event";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function createEventAction(formData: FormData) {
  const input = createEventSchema.parse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    eventDate: String(formData.get("eventDate") ?? "") || undefined,
    location: String(formData.get("location") ?? "") || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx.insert(weddingEvents).values({
        workspaceId: input.workspaceId,
        name: input.name,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        location: input.location || null,
        notes: input.notes || null,
      });
    },
  );

  revalidatePath("/");
}

export async function deleteEventAction(formData: FormData) {
  const input = deleteEventSchema.parse({
    workspaceId: formData.get("workspaceId"),
    eventId: formData.get("eventId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .delete(weddingEvents)
        .where(
          and(
            eq(weddingEvents.id, input.eventId),
            eq(weddingEvents.workspaceId, input.workspaceId),
          ),
        );
    },
  );

  revalidatePath("/");
}

export async function getEventsAction(workspaceId: string) {
  return withWorkspace(
    { workspaceId },
    async (tx) => {
      return tx
        .select()
        .from(weddingEvents)
        .where(eq(weddingEvents.workspaceId, workspaceId));
    },
  );
}
