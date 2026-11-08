"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { vendors, vendorQuotations } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";

/**
 * Get vendor comparison data (VND-06)
 * Compares vendors in the same category with their quotations
 */
export async function getVendorComparison(workspaceId: string, category: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Get vendors in the workspace
  const vendorsInWorkspace = await db
    .select()
    .from(vendors)
    .where(eq(vendors.workspaceId, workspaceId))
    .limit(50);

  // Filter by category
  const filtered = vendorsInWorkspace.filter((v) => v.category === category);

  // Get quotations for each vendor
  const comparison = await Promise.all(
    filtered.map(async (vendor) => {
      const quotations = await db
        .select()
        .from(vendorQuotations)
        .where(eq(vendorQuotations.vendorId, vendor.id));

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
}
