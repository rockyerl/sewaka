"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { invoices, subscriptions } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Generate invoice for a subscription (SUB-09)
 */
export async function generateInvoiceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const subscriptionId = formData.get("subscriptionId") as string;
  if (!subscriptionId) throw new Error("Subscription ID required");

  const db = await getDb();
  const subscription = await db
    .select({
      id: subscriptions.id,
      workspaceId: subscriptions.workspaceId,
      planId: subscriptions.planId,
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (subscription.length === 0) throw new Error("Subscription not found");

  const sub = subscription[0];

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Calculate amount (in production, get from plan)
  const amount = "99000"; // Example: Rp 99,000/month

  // Due date: 30 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const [invoice] = await db
    .insert(invoices)
    .values({
      workspaceId: sub.workspaceId,
      subscriptionId: sub.id,
      invoiceNumber,
      amount,
      status: "PENDING",
      dueDate,
    })
    .returning();

  revalidatePath("/subscription/history");
  return { success: true, invoice };
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaidAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invoiceId = formData.get("invoiceId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!invoiceId || !workspaceId) throw new Error("Data tidak valid");

  const db = await getDb();
  await db
    .update(invoices)
    .set({
      status: "PAID",
      paidAt: new Date(),
    })
    .where(
      and(
        eq(invoices.id, invoiceId),
        eq(invoices.workspaceId, workspaceId)
      )
    );

  revalidatePath("/subscription/history");
  return { success: true };
}
