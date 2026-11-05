import { z } from "zod";

export const curatedVendorCategorySchema = z.enum([
  "PEMAES",
  "SANGGAR",
  "PRANATACARA",
  "MUSIK",
  "CATERING",
  "FOTOGRAFI",
]);

export type CuratedVendorCategory = z.infer<typeof curatedVendorCategorySchema>;

export const curatedVendorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tradition: z.enum(["JAWA", "SUNDA", "MINANG", "NASIONAL"]),
  category: curatedVendorCategorySchema,
  tagline: z.string(),
  description: z.string(),
  locationCity: z.string(),
  priceRange: z.string(),
  instagramHandle: z.string().nullable().optional(),
  whatsappNumber: z.string(),
  rating: z.union([z.string(), z.number()]).transform(Number),
  reviewCount: z.number().int(),
  isVerified: z.boolean(),
  specialties: z.array(z.string()).default([]),
  createdAt: z.date(),
});

export type CuratedVendor = z.infer<typeof curatedVendorSchema>;

export const bookmarkCuratedVendorSchema = z.object({
  workspaceId: z.string().uuid(),
  curatedVendorId: z.string().uuid(),
  category: z.string().optional(),
});
