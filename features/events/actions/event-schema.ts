import { z } from "zod";

export const createEventSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Nama acara wajib diisi").max(200),
  eventDate: z.string().optional(),
  location: z.string().max(240).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const deleteEventSchema = z.object({
  workspaceId: z.string().uuid(),
  eventId: z.string().uuid(),
});
