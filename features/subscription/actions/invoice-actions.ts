"use server";

import { and, eq } from "drizzle-orm";
import { invoices, subscriptions, subscriptionPlans } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { withWorkspace } from "@/lib/db/with-workspace";
import { randomBytes } from "node:crypto";

/**
 * Generate invoice for a subscription (SUB-09)
 */
export async function generateInvoiceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const subscriptionId = formData.get("subscriptionId") as string;
  if (!subscriptionId) throw new Error("Subscription ID required");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  if (!workspaceId) throw new Error("Workspace ID required");
  const invoice = await withWorkspace({ workspaceId, userId: session.user.id, allowedRoles: ["OWNER", "PARTNER"] }, async (tx) => {
    const [sub] = await tx.select({ id: subscriptions.id, planId: subscriptions.planId })
      .from(subscriptions).where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.workspaceId, workspaceId))).limit(1);
    if (!sub) throw new Error("Subscription not found");
    const [plan] = await tx.select({ price: subscriptionPlans.price }).from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, sub.planId)).limit(1);
    if (!plan) throw new Error("Subscription plan not found");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const [created] = await tx.insert(invoices).values({
      workspaceId, subscriptionId: sub.id,
      invoiceNumber: `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
      amount: plan.price, status: "PENDING", dueDate,
    }).returning();
    return created;
  });

  revalidatePath("/subscription/history");
  return { success: true, invoice };
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaidAction(formData: FormData) {
  void formData;
  throw new Error("Invoice payment status is managed by the verified payment webhook");
}
