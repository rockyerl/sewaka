"use server";

import { eq, and } from "drizzle-orm";
import { subscriptions, subscriptionPlans } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { revalidatePath } from "next/cache";

const FREE_TRIAL_DAYS = 14;

/**
 * Start free trial (SUB-02)
 * Creates a trial subscription for the workspace
 */
export async function startFreeTrial(workspaceId: string) {
  const trialEndDate = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER"] },
    async (tx) => {
      const [existing] = await tx
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.workspaceId, workspaceId))
        .limit(1);
      if (existing) {
        throw new Error("Workspace already has a subscription or trial");
      }

      const [premiumPlan] = await tx
        .select()
        .from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.name, "Premium"), eq(subscriptionPlans.isActive, "true")))
        .limit(1);
      if (!premiumPlan) throw new Error("Premium plan not found");

      const endDate = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
      try {
        await tx.insert(subscriptions).values({
          workspaceId,
          planId: premiumPlan.id,
          status: "ACTIVE",
          isTrial: true,
          trialEndsAt: endDate,
          expiresAt: endDate,
        });
      } catch (error) {
        // The workspace unique constraint prevents simultaneous trial starts.
        if (error && typeof error === "object" && "code" in error && error.code === "23505") {
          throw new Error("Workspace already has a subscription or trial");
        }
        throw error;
      }
      return endDate;
    },
  );

  revalidatePath("/subscription");
  return { success: true, trialEndsAt: trialEndDate };
}

/**
 * Check if workspace is in free trial
 */
export async function isInFreeTrial(workspaceId: string) {
  return withWorkspace({ workspaceId }, async (tx) => {
    const [subscription] = await tx
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.workspaceId, workspaceId), eq(subscriptions.isTrial, true)))
      .limit(1);
    if (!subscription) return { isInTrial: false, trialEndsAt: null };

    if (subscription.trialEndsAt && subscription.trialEndsAt < new Date()) {
      await tx.update(subscriptions).set({ status: "EXPIRED" }).where(eq(subscriptions.id, subscription.id));
      return { isInTrial: false, trialEndsAt: subscription.trialEndsAt };
    }
    return { isInTrial: subscription.status === "ACTIVE", trialEndsAt: subscription.trialEndsAt };
  });
}

/**
 * Get free trial status for a workspace
 */
export async function getFreeTrialStatus(workspaceId: string) {
  const [subscription] = await withWorkspace({ workspaceId }, async (tx) =>
    tx.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).limit(1),
  );

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
