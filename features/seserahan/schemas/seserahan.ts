import { z } from "zod";

export const seserahanCategorySchema = z.enum([
  "MAHAR",
  "BUSANA_ADAT",
  "PERHIASAN",
  "PERLENGKAPAN_IBADAH",
  "KOSMETIK",
  "KULINER_TRADISIONAL",
  "LAINNYA",
]);

export const seserahanStatusSchema = z.enum([
  "PLANNED",
  "PURCHASED",
  "DECORATED",
  "DELIVERED",
]);

export const seserahanPartySchema = z.enum([
  "GROOM_TO_BRIDE",
  "BRIDE_TO_GROOM",
]);

export const createSeserahanSchema = z.object({
  workspaceId: z.string().uuid(),
  boxNumber: z.coerce.number().int().min(1).default(1),
  giverParty: seserahanPartySchema.default("GROOM_TO_BRIDE"),
  title: z.string().trim().min(1).max(200),
  category: seserahanCategorySchema.default("LAINNYA"),
  estimatedCost: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
  actualCost: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
  status: seserahanStatusSchema.default("PLANNED"),
  notes: z.string().trim().max(500).optional(),
});

export const updateSeserahanStatusSchema = z.object({
  workspaceId: z.string().uuid(),
  itemId: z.string().uuid(),
  status: seserahanStatusSchema,
});

export const deleteSeserahanSchema = z.object({
  workspaceId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const seserahanItemSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  boxNumber: z.number().int(),
  giverParty: seserahanPartySchema,
  title: z.string(),
  category: seserahanCategorySchema,
  estimatedCost: z.union([z.string(), z.number()]).transform(String),
  actualCost: z.union([z.string(), z.number()]).transform(String),
  status: seserahanStatusSchema,
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SeserahanItem = z.infer<typeof seserahanItemSchema>;
