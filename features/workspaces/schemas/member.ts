import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Email tidak valid"),
  role: z.enum(["PARTNER", "FAMILY", "COORDINATOR"]).default("FAMILY"),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["PARTNER", "FAMILY", "COORDINATOR"]),
});

export const removeMemberSchema = z.object({
  memberId: z.string().uuid(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
