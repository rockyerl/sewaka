import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(120),
  coupleOne: z.string().trim().max(120).optional(),
  coupleTwo: z.string().trim().max(120).optional(),
  weddingDate: z.coerce.date().optional(),
  location: z.string().trim().max(240).optional(),
  totalBudget: z
    .string()
    .regex(/^(0|[1-9]\d{0,11})(\.\d{1,2})?$/)
    .default("0"),
  culturalTradition: z.enum(["JAWA", "SUNDA", "MINANG", "NASIONAL"]).default("JAWA"),
});

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
