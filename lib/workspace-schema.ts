import { z } from "zod";

export const workspaceRoleSchema = z.enum([
  "OWNER",
  "PARTNER",
  "FAMILY",
  "COORDINATOR",
]);

export const workspaceSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  coupleOne: z.string().nullable(),
  coupleTwo: z.string().nullable(),
  weddingDate: z.coerce.date().nullable(),
  location: z.string().nullable(),
  totalBudget: z.union([z.string(), z.number()]).transform(String),
  culturalTradition: z.string().nullable().default("JAWA"),
  invitationSlug: z.string().nullable().optional(),
  role: workspaceRoleSchema,
});

export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;
