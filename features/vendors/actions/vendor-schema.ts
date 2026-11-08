import { z } from "zod";
import { weddingCategoryEnum, WEDDING_CATEGORY_LABELS, WeddingCategory } from "@/lib/constants/wedding-categories";

// Re-export untuk backward compatibility
export { weddingCategoryEnum as vendorCategoryEnum, WEDDING_CATEGORY_LABELS as VENDOR_CATEGORY_LABELS };
export type { WeddingCategory as VendorCategory };

export const createVendorSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Nama vendor wajib diisi").max(200),
  category: weddingCategoryEnum,
  contactName: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").max(200).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updateVendorStatusSchema = z.object({
  workspaceId: z.string().uuid(),
  vendorId: z.string().uuid(),
  status: z.enum(["SHORTLISTED", "CONTACTED", "BOOKED"]),
});

export const deleteVendorSchema = z.object({
  workspaceId: z.string().uuid(),
  vendorId: z.string().uuid(),
});
