import { z } from "zod";

export const createGuestSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Nama tamu wajib diisi").max(200),
  email: z.string().email("Format email tidak valid").max(200).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  plusOnes: z.coerce.number().int().min(0).max(10).optional(),
});

export const updateGuestRsvpSchema = z.object({
  workspaceId: z.string().uuid(),
  guestId: z.string().uuid(),
  rsvpStatus: z.enum(["PENDING", "ACCEPTED", "DECLINED"]),
});

export const deleteGuestSchema = z.object({
  workspaceId: z.string().uuid(),
  guestId: z.string().uuid(),
});
