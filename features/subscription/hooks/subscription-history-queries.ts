import "server-only";

import { asc, eq } from "drizzle-orm";

import { withWorkspace } from "@/lib/db/with-workspace";
import { subscriptions, subscriptionPlans, paymentTransactions } from "@/lib/db/schema";

export type SubscriptionHistoryEntry = {
  subscriptionId: string;
  planName: string;
  status: string;
  startedAt: Date;
  expiresAt: Date | null;
  transactions: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    paidAt: Date | null;
    gateway: string | null;
  }[];
};

export async function getSubscriptionHistory(
  workspaceId: string,
  userId?: string,
): Promise<SubscriptionHistoryEntry[]> {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    // Get current/past subscriptions for workspace
    const subs = await tx
      .select({
        subscriptionId: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startedAt: subscriptions.startedAt,
        expiresAt: subscriptions.expiresAt,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.workspaceId, workspaceId))
      .orderBy(asc(subscriptions.startedAt));

    const history: SubscriptionHistoryEntry[] = [];

    for (const sub of subs) {
      // Get plan name
      const [plan] = await tx
        .select({ name: subscriptionPlans.name })
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, sub.planId))
        .limit(1);

      // Get transactions
      const transactions = await tx
        .select({
          id: paymentTransactions.id,
          amount: paymentTransactions.amount,
          currency: paymentTransactions.currency,
          status: paymentTransactions.status,
          paidAt: paymentTransactions.paidAt,
          gateway: paymentTransactions.gateway,
        })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.subscriptionId, sub.subscriptionId))
        .orderBy(asc(paymentTransactions.createdAt));

      history.push({
        subscriptionId: sub.subscriptionId,
        planName: plan?.name ?? "Unknown",
        status: sub.status,
        startedAt: sub.startedAt,
        expiresAt: sub.expiresAt,
        transactions,
      });
    }

    return history;
  });
}
