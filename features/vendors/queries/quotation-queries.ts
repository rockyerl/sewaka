import { eq, and, desc } from "drizzle-orm";
import { vendorQuotations, vendorPayments, vendors } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

export async function listQuotationsByVendor(vendorId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select()
      .from(vendorQuotations)
      .where(
        and(
          eq(vendorQuotations.workspaceId, workspaceId),
          eq(vendorQuotations.vendorId, vendorId),
        ),
      )
      .orderBy(desc(vendorQuotations.createdAt));
  });
}

export async function listAllQuotations() {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select({
        id: vendorQuotations.id,
        vendorId: vendorQuotations.vendorId,
        quotationNumber: vendorQuotations.quotationNumber,
        amount: vendorQuotations.amount,
        description: vendorQuotations.description,
        status: vendorQuotations.status,
        quotedDate: vendorQuotations.quotedDate,
        validUntil: vendorQuotations.validUntil,
        createdAt: vendorQuotations.createdAt,
        vendorName: vendors.name,
        vendorCategory: vendors.category,
      })
      .from(vendorQuotations)
      .leftJoin(vendors, eq(vendorQuotations.vendorId, vendors.id))
      .where(eq(vendorQuotations.workspaceId, workspaceId))
      .orderBy(desc(vendorQuotations.createdAt));
  });
}

export async function createQuotation(data: {
  vendorId: string;
  quotationNumber?: string;
  amount: string;
  description?: string;
  quotedDate?: string;
  validUntil?: string;
}) {
  return withWorkspace(async (tx, workspaceId) => {
    const [created] = await tx
      .insert(vendorQuotations)
      .values({
        workspaceId,
        vendorId: data.vendorId,
        quotationNumber: data.quotationNumber ?? null,
        amount: data.amount,
        description: data.description ?? null,
        quotedDate: data.quotedDate ? new Date(data.quotedDate) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      })
      .returning();
    return created;
  });
}

export async function updateQuotationStatus(quotationId: string, status: "PENDING" | "ACCEPTED" | "REJECTED") {
  return withWorkspace(async (tx, workspaceId) => {
    const [updated] = await tx
      .update(vendorQuotations)
      .set({ status })
      .where(
        and(
          eq(vendorQuotations.id, quotationId),
          eq(vendorQuotations.workspaceId, workspaceId),
        ),
      )
      .returning();
    return updated;
  });
}

export async function deleteQuotation(quotationId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .delete(vendorQuotations)
      .where(
        and(
          eq(vendorQuotations.id, quotationId),
          eq(vendorQuotations.workspaceId, workspaceId),
        ),
      );
  });
}

// Vendor Payments

export async function listPaymentsByVendor(vendorId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select()
      .from(vendorPayments)
      .where(
        and(
          eq(vendorPayments.workspaceId, workspaceId),
          eq(vendorPayments.vendorId, vendorId),
        ),
      )
      .orderBy(desc(vendorPayments.paymentDate));
  });
}

export async function listAllPayments() {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select({
        id: vendorPayments.id,
        vendorId: vendorPayments.vendorId,
        quotationId: vendorPayments.quotationId,
        amount: vendorPayments.amount,
        paymentType: vendorPayments.paymentType,
        paymentDate: vendorPayments.paymentDate,
        note: vendorPayments.note,
        createdAt: vendorPayments.createdAt,
        vendorName: vendors.name,
      })
      .from(vendorPayments)
      .leftJoin(vendors, eq(vendorPayments.vendorId, vendors.id))
      .where(eq(vendorPayments.workspaceId, workspaceId))
      .orderBy(desc(vendorPayments.paymentDate));
  });
}

export async function createVendorPayment(data: {
  vendorId: string;
  quotationId?: string;
  amount: string;
  paymentType: string;
  paymentDate?: string;
  note?: string;
}) {
  return withWorkspace(async (tx, workspaceId) => {
    const [created] = await tx
      .insert(vendorPayments)
      .values({
        workspaceId,
        vendorId: data.vendorId,
        quotationId: data.quotationId ?? null,
        amount: data.amount,
        paymentType: data.paymentType,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        note: data.note ?? null,
      })
      .returning();
    return created;
  });
}

export async function deletePayment(paymentId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .delete(vendorPayments)
      .where(
        and(
          eq(vendorPayments.id, paymentId),
          eq(vendorPayments.workspaceId, workspaceId),
        ),
      );
  });
}
