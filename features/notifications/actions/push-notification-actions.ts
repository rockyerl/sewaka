"use server";

import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pushNotificationSubscriptions } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";

/**
 * Subscribe to push notifications (COL-07)
 * Saves the push subscription to the database
 */
export async function subscribeToPushNotifications(subscription: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Check if subscription already exists
  const [existing] = await db
    .select()
    .from(pushNotificationSubscriptions)
    .where(
      and(
        eq(pushNotificationSubscriptions.userId, session.user.id),
        eq(pushNotificationSubscriptions.endpoint, subscription.endpoint)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing subscription
    await db
      .update(pushNotificationSubscriptions)
      .set({
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        userAgent: subscription.userAgent,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(pushNotificationSubscriptions.id, existing.id));
  } else {
    // Create new subscription
    await db.insert(pushNotificationSubscriptions).values({
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      userAgent: subscription.userAgent,
      isActive: true,
    });
  }

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Unsubscribe from push notifications (COL-07)
 * Removes the push subscription from the database
 */
export async function unsubscribeFromPushNotifications(endpoint: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  await db
    .delete(pushNotificationSubscriptions)
    .where(
      and(
        eq(pushNotificationSubscriptions.userId, session.user.id),
        eq(pushNotificationSubscriptions.endpoint, endpoint)
      )
    );

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Get push notification subscriptions for current user
 */
export async function getPushNotificationSubscriptions() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const db = getDb();

  return db
    .select()
    .from(pushNotificationSubscriptions)
    .where(eq(pushNotificationSubscriptions.userId, session.user.id));
}

/**
 * Send push notification to a user
 * This is called by the notification scheduler
 */
export async function sendPushNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
  const db = getDb();

  const subscriptions = await db
    .select()
    .from(pushNotificationSubscriptions)
    .where(
      and(
        eq(pushNotificationSubscriptions.userId, userId),
        eq(pushNotificationSubscriptions.isActive, true)
      )
    );

  const results = [];

  for (const sub of subscriptions) {
    try {
      // In a real implementation, you would use Web Push protocol here
      // For now, we just log the notification
      console.log(`Push notification to ${userId}:`, { title, body, data, endpoint: sub.endpoint });
      
      results.push({ success: true, endpoint: sub.endpoint });
    } catch (error) {
      console.error(`Failed to send push notification to ${userId}:`, error);
      results.push({ success: false, endpoint: sub.endpoint, error: String(error) });
    }
  }

  return results;
}
