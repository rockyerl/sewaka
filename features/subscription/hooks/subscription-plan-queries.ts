import { eq, and, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema";

export const DEFAULT_PLANS = [
  {
    name: "Gratis",
    description: "Mulai persiapan pernikahanmu tanpa biaya.",
    price: "0",
    currency: "IDR",
    durationMonths: 12,
    maxVendors: 10,
    maxGuests: 50,
    maxStorageBytes: 50 * 1024 * 1024,
    features: ["tasks", "budget", "guests_basic", "vendors_basic"],
    isActive: "true",
    sortOrder: 1,
  },
  {
    name: "Premium",
    description: "Semua fitur untuk persiapan sempurna.",
    price: "99000",
    currency: "IDR",
    durationMonths: 1,
    maxVendors: null,
    maxGuests: 500,
    maxStorageBytes: 1024 * 1024 * 1024,
    features: [
      "tasks",
      "budget",
      "guests_basic",
      "vendors_basic",
      "invitations_digital",
      "qr_checkin",
      "family_collaboration",
      "financial_reports",
      "priority_support",
    ],
    isActive: "true",
    sortOrder: 2,
  },
  {
    name: "Enterprise",
    description: "Untuk wedding planner, organizer, dan venue.",
    price: "0",
    currency: "IDR",
    durationMonths: null,
    maxVendors: null,
    maxGuests: null,
    maxStorageBytes: null,
    features: [
      "tasks",
      "budget",
      "guests_basic",
      "vendors_basic",
      "invitations_digital",
      "qr_checkin",
      "family_collaboration",
      "financial_reports",
      "priority_support",
      "multi_workspace",
      "api_access",
    ],
    isActive: "true",
    sortOrder: 3,
  },
];

/**
 * Get all active subscription plans for user-facing pages
 */
export async function getActivePlans() {
  const db = getDb();
  let plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, "true"))
    .orderBy(asc(subscriptionPlans.sortOrder));

  if (plans.length === 0) {
    try {
      plans = await db
        .insert(subscriptionPlans)
        .values(DEFAULT_PLANS)
        .returning();
    } catch {
      plans = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, "true"))
        .orderBy(asc(subscriptionPlans.sortOrder));
    }
  }
  
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
