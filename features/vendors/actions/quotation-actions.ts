"use server";

import { revalidatePath } from "next/cache";
import {
  createQuotation,
  updateQuotationStatus,
  deleteQuotation,
  createVendorPayment,
  deletePayment,
  listQuotationsByVendor,
  listPaymentsByVendor,
} from "../queries/quotation-queries";
import {
  createQuotationSchema,
  updateQuotationStatusSchema,
  createVendorPaymentSchema,
} from "../schemas/quotation";

export async function getVendorQuotationsAction(vendorId: string, workspaceId: string) {
  return listQuotationsByVendor(vendorId);
}

export async function getVendorPaymentsAction(vendorId: string, workspaceId: string) {
  return listPaymentsByVendor(vendorId);
}

export async function createQuotationAction(formData: FormData) {
  const input = createQuotationSchema.parse({
    vendorId: formData.get("vendorId"),
    quotationNumber: formData.get("quotationNumber") || undefined,
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    quotedDate: formData.get("quotedDate") || undefined,
    validUntil: formData.get("validUntil") || undefined,
  });

  await createQuotation(input);
  revalidatePath("/vendors");
}

export async function updateQuotationStatusAction(formData: FormData) {
  const input = updateQuotationStatusSchema.parse({
    quotationId: formData.get("quotationId"),
    status: formData.get("status"),
  });

  await updateQuotationStatus(input.quotationId, input.status);
  revalidatePath("/vendors");
}

export async function deleteQuotationAction(formData: FormData) {
  const quotationId = formData.get("quotationId") as string;
  await deleteQuotation(quotationId);
  revalidatePath("/vendors");
}

export async function createVendorPaymentAction(formData: FormData) {
  const input = createVendorPaymentSchema.parse({
    vendorId: formData.get("vendorId"),
    quotationId: formData.get("quotationId") || undefined,
    amount: formData.get("amount"),
    paymentType: formData.get("paymentType") || "DP",
    paymentDate: formData.get("paymentDate") || undefined,
    note: formData.get("note") || undefined,
  });

  await createVendorPayment(input);
  revalidatePath("/vendors");
}

export async function deletePaymentAction(formData: FormData) {
  const paymentId = formData.get("paymentId") as string;
  await deletePayment(paymentId);
  revalidatePath("/vendors");
}
