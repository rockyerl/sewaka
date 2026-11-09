"use server";

import { and, eq } from "drizzle-orm";
import { vendors, vendorQuotations } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

/**
 * Get vendor comparison data (VND-06)
 * Compares vendors in the same category with their quotations
 */
export async function getVendorComparison(workspaceId: string, category: string) {
  return withWorkspace({ workspaceId }, async (tx) => {
    const vendorsInWorkspace = await tx
      .select()
      .from(vendors)
      .where(and(eq(vendors.workspaceId, workspaceId), eq(vendors.category, category)))
      .limit(50);

    const comparison = await Promise.all(
      vendorsInWorkspace.map(async (vendor) => {
      const quotations = await tx
        .select()
        .from(vendorQuotations)
        .where(and(eq(vendorQuotations.vendorId, vendor.id), eq(vendorQuotations.workspaceId, workspaceId)));

      // Serialize quotations: convert numeric amount to string for JSON compatibility
      const serializedQuotations = quotations.map((q) => ({
        id: q.id,
        amount: String(q.amount),
        description: q.description,
        status: q.status,
      }));

      const lowestQuote = serializedQuotations.length > 0
        ? serializedQuotations.reduce((min, q) =>
            Number(q.amount) < Number(min.amount) ? q : min
          )
        : null;

      return {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          category: vendor.category,
          status: vendor.status,
          contactName: vendor.contactName,
          phone: vendor.phone,
          email: vendor.email,
          notes: vendor.notes,
        },
        quotations: serializedQuotations,
        lowestQuote: lowestQuote ? { amount: lowestQuote.amount } : null,
        status: vendor.status,
      };
      }),
    );

    return comparison;
  });
}
