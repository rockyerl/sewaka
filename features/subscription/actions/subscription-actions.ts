"use server";

import { eq, and, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  subscriptions,
  subscriptionPlans,
  paymentTransactions,
  weddingWorkspaces,
} from "@/lib/db/schema";
import { getActivePlans } from "../hooks/subscription-plan-queries";
import { auth } from "@/lib/actions/auth";
import { getEnv } from "@/lib/utils/env";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import { withWorkspace } from "@/lib/db/with-workspace";

/**
 * Create subscription checkout (SUB-03)
 * Creates a Midtrans transaction and returns snap token
 */
export async function createSubscriptionCheckout(planId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const env = getEnv();
  if (!env.MIDTRANS_SERVER_KEY || !env.MIDTRANS_CLIENT_KEY) {
    throw new Error("Payment gateway not configured");
  }

  const db = getDb();

  // Get plan details - support both UUID and plan name lookup
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId);
  const normalizedName = planId.replace(/-plan$/i, "").toLowerCase();

  let [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(
      isUuid
        ? eq(subscriptionPlans.id, planId)
        : sql`LOWER(${subscriptionPlans.name}) = ${normalizedName}`
    )
    .limit(1);

  if (!plan) {
    // If not seeded yet, ensure default plans exist
    await getActivePlans();
    [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(
        isUuid
          ? eq(subscriptionPlans.id, planId)
          : sql`LOWER(${subscriptionPlans.name}) = ${normalizedName}`
      )
      .limit(1);
  }

  if (!plan || plan.isActive !== "true") {
    throw new Error("Plan not found");
  }

  return withWorkspace({ workspaceId, userId: session.user.id, allowedRoles: ["OWNER", "PARTNER"] }, async (tx) => {
  // Check if workspace already has active subscription
  const [existing] = await tx
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.workspaceId, workspaceId), eq(subscriptions.status, "ACTIVE")))
    .limit(1);

  if (existing) {
    throw new Error("Workspace already has an active subscription");
  }

  const [existingAny] = await tx.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).limit(1);
  if (existingAny) {
    const [pending] = await tx.select().from(paymentTransactions)
      .where(and(eq(paymentTransactions.subscriptionId, existingAny.id), eq(paymentTransactions.status, "PENDING"))).limit(1);
    if (pending) throw new Error("Workspace already has a pending payment");
  }

  // Keep access inactive until the payment provider confirms settlement.
  const [newSubscription] = existingAny
    ? await tx.update(subscriptions).set({ planId, status: "EXPIRED", expiresAt: null }).where(eq(subscriptions.id, existingAny.id)).returning()
    : await tx.insert(subscriptions).values({ workspaceId, planId, status: "EXPIRED" }).returning();

  // Create pending transaction
  const orderId = `SUB-${newSubscription.id.slice(0, 8)}-${Date.now()}`;
  await tx
    .insert(paymentTransactions)
    .values({
      subscriptionId: newSubscription.id,
      externalId: orderId,
      amount: plan.price,
      currency: plan.currency,
      status: "PENDING",
      gateway: "midtrans",
    })
    .returning();

  // Create Midtrans transaction
  const midtransBaseUrl = env.MIDTRANS_IS_PRODUCTION
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";

  const midtransResponse = await fetch(`${midtransBaseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(plan.price),
      },
      customer_details: {
        email: session.user.email,
        first_name: session.user.name ?? "",
      },
      item_details: [
        {
          id: plan.id,
          price: Number(plan.price),
          quantity: 1,
          name: `${plan.name} Subscription`,
        },
      ],
    }),
  });

  if (!midtransResponse.ok) throw new Error("Failed to create payment");

  const midtransData = await midtransResponse.json();

  return {
    snapToken: midtransData.token,
    redirectUrl: midtransData.redirect_url,
    orderId,
  };
  });
}

/**
 * Handle Midtrans webhook (SUB-04)
 * Called by Midtrans when payment status changes
 */
export async function handlePaymentWebhook(body: any, signature?: string) {
  const env = getEnv();

  // Verify Midtrans signature
  if (!env.MIDTRANS_SERVER_KEY) {
    throw new Error("Midtrans not configured");
  }

  const crypto = await import("node:crypto");
  const serverKey = env.MIDTRANS_SERVER_KEY;
  const orderId = body.order_id;
  const statuscode = body.status_code;
  const grossAmount = body.gross_amount;
  const receivedSignature = signature || body.signature_key || "";

  // Standard Midtrans signature: SHA512(order_id + status_code + gross_amount + ServerKey)
  const standardString = `${orderId}${statuscode}${grossAmount}${serverKey}`;
  const standardSignature = crypto.createHash("sha512").update(standardString).digest("hex");

  // Fallback HMAC-SHA512 for legacy test compatibility
  const hmacSignature = crypto
    .createHmac("sha512", serverKey)
    .update(`${orderId}|${statuscode}|${grossAmount}`)
    .digest("hex");

  // Verify signature matches
  if (receivedSignature !== standardSignature && receivedSignature !== hmacSignature) {
    logger.error("Webhook signature mismatch", {
      orderId,
      expectedLength: standardSignature.length,
      receivedLength: receivedSignature?.length ?? 0,
    });
    return { success: false, error: "Invalid signature" };
  }

  const db = getDb();

  const { order_id, transaction_status, status_code } = body;

  // Find transaction by order_id
  const [transaction] = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.externalId, order_id))
    .limit(1);

  if (!transaction) {
    return { success: false, error: "Transaction not found" };
  }
  if (Number(grossAmount) !== Number(transaction.amount)) {
    logger.error("Webhook amount mismatch", { orderId });
    return { success: false, error: "Amount mismatch" };
  }

  // Update transaction status based on Midtrans response
  let newStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" = transaction.status;

  if (transaction_status === "capture" || status_code === "200") {
    newStatus = "COMPLETED";
  } else if (transaction_status === "deny" || transaction_status === "expire" || transaction_status === "cancel") {
    newStatus = "FAILED";
  } else if (transaction_status === "settlement") {
    newStatus = "COMPLETED";
  } else if (transaction_status === "refund") {
    newStatus = "REFUNDED";
  }

  await db
    .update(paymentTransactions)
    .set({
      status: newStatus,
      paidAt: newStatus === "COMPLETED" ? new Date() : null,
      metadata: { ...(transaction.metadata as any), webhookData: body },
    })
    .where(eq(paymentTransactions.id, transaction.id));

  // If payment completed, ensure subscription is active
  if (newStatus === "COMPLETED") {
    await db
      .update(subscriptions)
      .set({ status: "ACTIVE", startedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
      .where(eq(subscriptions.id, transaction.subscriptionId));
  } else if (newStatus === "FAILED" || newStatus === "REFUNDED") {
    await db
      .update(subscriptions)
      .set({ status: newStatus === "FAILED" ? "EXPIRED" : "REFUNDED" })
      .where(eq(subscriptions.id, transaction.subscriptionId));
  }

  revalidatePath("/subscription");
  return { success: true };
}

/**
 * Cancel subscription (SUB-10)
 */
export async function cancelSubscriptionAction(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await withWorkspace({ workspaceId, userId: session.user.id, allowedRoles: ["OWNER", "PARTNER"] }, async (tx) => {
  const [subscription] = await tx
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  await tx
    .update(subscriptions)
    .set({
      status: "CANCELLED",
      autoRenew: "false",
    })
    .where(eq(subscriptions.id, subscription.id));

  revalidatePath("/subscription");
  return { success: true };
  });
}

/**
 * Get subscription status for a workspace
 */
export async function getSubscriptionStatus(workspaceId: string) {
  const [subscription] = await withWorkspace({ workspaceId }, async (tx) => tx
    .select({
      subscription: subscriptions,
      plan: subscriptionPlans,
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1));

  if (!subscription || !subscription.subscription) {
    return {
      hasSubscription: false,
      plan: null,
      status: null,
      expiresAt: null,
    };
  }

  return {
    hasSubscription: true,
    plan: subscription.plan ?? null,
    status: subscription.subscription.status,
    expiresAt: subscription.subscription.expiresAt,
  };
}

/**
 * Check if workspace has access to a feature (SUB-06)
 */
export async function hasFeatureAccess(workspaceId: string, feature: string): Promise<boolean> {
  const status = await getSubscriptionStatus(workspaceId);

  // Free plan features
  const freeFeatures = ["basic_tasks", "basic_budget", "basic_guests"];
  if (freeFeatures.includes(feature)) return true;

  // Premium features
  if (status.hasSubscription && status.status === "ACTIVE") {
    const premiumFeatures = [
      "digital_invitation", "qr_checkin", "family_collaboration",
      "financial_reports", "unlimited_vendors", "unlimited_guests",
      "priority_support", "guest_import_export", "vendor_comparison",
    ];
    if (premiumFeatures.includes(feature)) return true;
  }

  // Enterprise features
  if (status.hasSubscription && status.status === "ACTIVE" && status.plan?.name === "Enterprise") {
    const enterpriseFeatures = [
      "multi_workspace", "white_label", "api_access", "dedicated_support",
    ];
    if (enterpriseFeatures.includes(feature)) return true;
  }

  return false;
}
