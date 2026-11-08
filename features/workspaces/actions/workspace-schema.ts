import { z } from "zod";

export { workspaceRoleSchema, workspaceSummarySchema, type WorkspaceSummary } from "@/lib/schemas/workspace-schema";

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
