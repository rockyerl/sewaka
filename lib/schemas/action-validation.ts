import { z } from "zod";

/**
 * Shared validation schemas for server actions.
 * Use these instead of duplicating pagination/entity ID validation in each feature.
 */

export const paginationInputSchema = z.object({
  page: z.number().int().min(1).max(1_000_000).optional(),
  itemPerPage: z.number().int().min(1).max(5_000).optional(),
});

export const entityIdSchema = z.string().trim().min(1).max(128);

export const optionalEntityIdSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  entityIdSchema.optional(),
);

export const isoDateInputSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

export const workspaceIdSchema = z.string().uuid("Workspace ID tidak valid");

export function getInputErrorMessage(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
    .join("; ");
}
