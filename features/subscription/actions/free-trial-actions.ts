"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscriptions, subscriptionPlans, weddingWorkspaces } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";

const FREE_TRIAL_DAYS = 14;

/**
 * Start free trial (SUB-02)
 * Creates a trial subscription for the workspace
 */
export async function startFreeTrial(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Check if workspace already has active subscription or trial
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.workspaceId, workspaceId),
        eq(subscriptions.status, "ACTIVE")
      )
    )
    .limit(1);

  if (existing) {
    throw new Error("Workspace already has an active subscription or trial");
  }

  // Get the premium plan
  const [premiumPlan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.name, "Premium"))
    .limit(1);

  if (!premiumPlan) {
    throw new Error("Premium plan not found");
  }

  // Create trial subscription
  const trialEndDate = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(subscriptions).values({
    workspaceId,
    planId: premiumPlan.id,
    status: "ACTIVE",
    isTrial: true,
    trialEndsAt: trialEndDate,
    expiresAt: trialEndDate,
  });

  revalidatePath("/subscription");
  return { success: true, trialEndsAt: trialEndDate };
}

/**
 * Check if workspace is in free trial
 */
export async function isInFreeTrial(workspaceId: string) {
  const db = getDb();

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.workspaceId, workspaceId),
        eq(subscriptions.isTrial, true)
      )
    )
    .limit(1);

  if (!subscription) {
    return { isInTrial: false, trialEndsAt: null };
  }

  // Check if trial has expired
  if (subscription.trialEndsAt && subscription.trialEndsAt < new Date()) {
    // Expire the trial
    await db
      .update(subscriptions)
      .set({ status: "EXPIRED" })
      .where(eq(subscriptions.id, subscription.id));

    return { isInTrial: false, trialEndsAt: subscription.trialEndsAt };
  }

  return { isInTrial: true, trialEndsAt: subscription.trialEndsAt };
}

/**
 * Get free trial status for a workspace
 */
export async function getFreeTrialStatus(workspaceId: string) {
  const db = getDb();

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  if (!subscription || !subscription.isTrial) {
    return {
      hasTrial: false,
      isInTrial: false,
      trialEndsAt: null,
      daysRemaining: 0,
    };
  }

  const now = new Date();
  const trialEndsAt = subscription.trialEndsAt;
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    hasTrial: true,
    isInTrial: subscription.status === "ACTIVE" && trialEndsAt && trialEndsAt > now,
    trialEndsAt,
    daysRemaining,
  };
}
