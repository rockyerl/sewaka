import { eq, and, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema";

/**
 * Get all active subscription plans for user-facing pages
 */
export async function getActivePlans() {
  const db = getDb();
  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, "true"))
    .orderBy(asc(subscriptionPlans.sortOrder));
  
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    durationMonths: plan.durationMonths,
    maxVendors: plan.maxVendors,
    maxGuests: plan.maxGuests,
    maxStorageBytes: plan.maxStorageBytes,
    features: plan.features as string[] | null,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
  }));
}

/**
 * Get a single subscription plan by ID
 */
export async function getPlanById(id: string) {
  const db = getDb();
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .limit(1);
  
  return plan || null;
}

/**
 * Check if a plan is available (active and exists)
 */
export async function isPlanAvailable(name: string) {
  const db = getDb();
  const [plan] = await db
    .select({ id: subscriptionPlans.id, isActive: subscriptionPlans.isActive })
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.name, name), eq(subscriptionPlans.isActive, "true")))
    .limit(1);
  
  return !!plan;
}
