import { z } from "zod";

export const createQuotationSchema = z.object({
  vendorId: z.string().uuid("Vendor tidak valid"),
  quotationNumber: z.string().max(100).optional(),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
    message: "Jumlah harus angka positif",
  }),
  description: z.string().max(1000).optional(),
  quotedDate: z.string().optional(),
  validUntil: z.string().optional(),
});

export const updateQuotationStatusSchema = z.object({
  quotationId: z.string().uuid(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
});

export const createVendorPaymentSchema = z.object({
  vendorId: z.string().uuid("Vendor tidak valid"),
  quotationId: z.string().uuid().optional(),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
    message: "Jumlah harus angka positif",
  }),
  paymentType: z.string().max(50).default("DP"),
  paymentDate: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationStatusInput = z.infer<typeof updateQuotationStatusSchema>;
export type CreateVendorPaymentInput = z.infer<typeof createVendorPaymentSchema>;
