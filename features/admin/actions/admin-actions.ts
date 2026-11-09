"use server";

import { eq, and, count, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { logAdminAction } from "@/features/admin/lib/audit";
import { z } from "zod";
import {
  users,
  weddingWorkspaces,
  workspaceMembers,
  subscriptionPlans,
  subscriptions,
  paymentTransactions,
  activityLogs,
  weddingEvents,
  tasks,
  guests,
  vendors,
  documents,
  calendarSyncs,
  supportTickets,
  checkInLogs,
} from "@/lib/db/schema";

/**
 * Get admin dashboard statistics (ADM-01)
 */
export async function getAdminStats() {
  await requireAdmin();
  const db = getDb();

  const [
    userStats,
    workspaceStats,
    subscriptionStats,
    paymentStats,
    eventStats,
    taskStats,
    guestStats,
    vendorStats,
    documentStats,
    calendarStats,
    supportStats,
    checkInStats,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(weddingWorkspaces),
    db.select({
      total: count(),
      active: sql<number>`count(case when ${subscriptions.status} = 'ACTIVE' then 1 end)`,
    }).from(subscriptions),
    db.select({
      total: sql<string>`coalesce(sum(${paymentTransactions.amount}), 0)`,
      count: count(),
    }).from(paymentTransactions).where(eq(paymentTransactions.status, "COMPLETED")),
    db.select({ total: count() }).from(weddingEvents),
    db.select({ total: count() }).from(tasks),
    db.select({
      total: count(),
      checkedIn: sql<number>`count(case when ${guests.checkedIn} then 1 end)`,
    }).from(guests),
    db.select({ total: count() }).from(vendors),
    db.select({ total: count() }).from(documents),
    db.select({ total: count() }).from(calendarSyncs).where(eq(calendarSyncs.isActive, true)),
    db.select({ total: count() }).from(supportTickets).where(sql`${supportTickets.status} IN ('OPEN', 'IN_PROGRESS')`),
    db.select({ total: count() }).from(checkInLogs),
  ]);

  return {
    totalUsers: Number(userStats[0].total),
    totalWorkspaces: Number(workspaceStats[0].total),
    totalSubscriptions: Number(subscriptionStats[0].total),
    activeSubscriptions: Number(subscriptionStats[0].active),
    totalRevenue: Number(paymentStats[0].total),
    totalTransactions: Number(paymentStats[0].count),
    productUsage: {
      events: Number(eventStats[0].total),
      tasks: Number(taskStats[0].total),
      guests: Number(guestStats[0].total),
      checkedInGuests: Number(guestStats[0].checkedIn),
      vendors: Number(vendorStats[0].total),
      documents: Number(documentStats[0].total),
      connectedCalendars: Number(calendarStats[0].total),
      openSupportTickets: Number(supportStats[0].total),
      checkInLogs: Number(checkInStats[0].total),
    },
  };
}

/**
 * List all users (ADM-02)
 */
export async function listAdminUsers({
  search,
  page = 1,
  limit = 20,
}: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  const db = getDb();
  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));
  const offset = (page - 1) * limit;

  const where = search
    ? and(
        sql`${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`,
      )
    : undefined;

  const [userList, total] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return {
    users: userList,
    pagination: {
      page,
      limit,
      total: Number(total[0].total),
      totalPages: Math.ceil(Number(total[0].total) / limit),
    },
  };
}

/**
 * Update user role (ADM-02)
 */
export async function updateUserRole(userId: string, role: "admin" | "user") {
  const { userId: actorId } = await requireAdmin();
  if (!userId || !["admin", "user"].includes(role)) throw new Error("Invalid user role update");
  if (userId === actorId) throw new Error("You cannot change your own admin role");
  const db = getDb();
  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) throw new Error("User not found");
  if (role === "user") {
    const [adminCount] = await db.select({ total: count() }).from(users).where(eq(users.role, "admin"));
    if (target?.role === "admin" && Number(adminCount.total) <= 1) {
      throw new Error("At least one administrator must remain");
    }
  }
  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning({ id: users.id, role: users.role });
  if (!updated) throw new Error("User not found");
  await logAdminAction("update", "user_role", userId, { role: target.role }, { role }, null);
  return updated;
}

/**
 * List all workspaces (ADM-03)
 */
export async function listAdminWorkspaces({
  search,
  page = 1,
  limit = 20,
}: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  const db = getDb();
  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));
  const offset = (page - 1) * limit;

  const where = search
    ? and(
        sql`${weddingWorkspaces.name} ILIKE ${`%${search}%`} OR ${weddingWorkspaces.coupleOne} ILIKE ${`%${search}%`} OR ${weddingWorkspaces.coupleTwo} ILIKE ${`%${search}%`}`,
      )
    : undefined;

  const [workspaceList, total] = await Promise.all([
    db
      .select({
        id: weddingWorkspaces.id,
        name: weddingWorkspaces.name,
        coupleOne: weddingWorkspaces.coupleOne,
        coupleTwo: weddingWorkspaces.coupleTwo,
        weddingDate: weddingWorkspaces.weddingDate,
        location: weddingWorkspaces.location,
        culturalTradition: weddingWorkspaces.culturalTradition,
        createdAt: weddingWorkspaces.createdAt,
      })
      .from(weddingWorkspaces)
      .where(where)
      .orderBy(sql`${weddingWorkspaces.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(weddingWorkspaces).where(where),
  ]);

  return {
    workspaces: workspaceList,
    pagination: {
      page,
      limit,
      total: Number(total[0].total),
      totalPages: Math.ceil(Number(total[0].total) / limit),
    },
  };
}

/**
 * List subscription plans (ADM-04)
 */
export async function listAdminPlans() {
  await requireAdmin();
  const db = getDb();

  return db
    .select()
    .from(subscriptionPlans)
    .orderBy(subscriptionPlans.sortOrder);
}

const planFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).nullable(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  durationMonths: z.number().int().positive().nullable(),
  maxVendors: z.number().int().nonnegative().nullable(),
  maxGuests: z.number().int().nonnegative().nullable(),
  maxStorageBytes: z.number().int().nonnegative().nullable(),
  features: z.array(z.string().trim().min(1).max(100)).max(100).nullable(),
  isActive: z.enum(["true", "false"]),
  sortOrder: z.number().int().nonnegative(),
});

function parsePlanFormData(formData: FormData) {
  const optionalNumber = (key: string) => {
    const value = formData.get(key);
    if (value === null || value === "") return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error(`Invalid ${key}`);
    return parsed;
  };
  const rawFeatures = formData.get("features");
  let features: unknown = null;
  if (typeof rawFeatures === "string" && rawFeatures) {
    try {
      features = JSON.parse(rawFeatures);
    } catch {
      throw new Error("Invalid plan features");
    }
  }
  return planFormSchema.parse({
    name: formData.get("name"),
    description: (formData.get("description") as string | null)?.trim() || null,
    price: formData.get("price"),
    currency: formData.get("currency") || "IDR",
    durationMonths: optionalNumber("durationMonths"),
    maxVendors: optionalNumber("maxVendors"),
    maxGuests: optionalNumber("maxGuests"),
    maxStorageBytes: optionalNumber("maxStorageBytes"),
    features,
    isActive: formData.get("isActive") || "false",
    sortOrder: Number(formData.get("sortOrder") || 0),
  });
}

/**
 * Create subscription plan (ADM-04)
 */
export async function createPlanAction(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const values = parsePlanFormData(formData);
  const [result] = await db.insert(subscriptionPlans).values(values).returning();
  await logAdminAction("create", "subscription_plan", result.id, null, { name: result.name, price: result.price }, null);
  return result;
}

/**
 * Update subscription plan (ADM-04)
 */
export async function updatePlanAction(id: string, formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const values = parsePlanFormData(formData);
  const [existing] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
  if (!existing) throw new Error("Subscription plan not found");
  const [result] = await db
    .update(subscriptionPlans)
    .set(values)
    .where(eq(subscriptionPlans.id, id))
    .returning();

  await logAdminAction("update", "subscription_plan", id, { name: existing.name, price: existing.price, isActive: existing.isActive }, { name: result.name, price: result.price, isActive: result.isActive }, null);
  return result;
}

/**
 * Delete subscription plan (ADM-04)
 */
export async function deletePlanAction(id: string) {
  await requireAdmin();
  const db = getDb();
  const [existing] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
  if (!existing) throw new Error("Subscription plan not found");
  const [usage] = await db.select({ total: count() }).from(subscriptions).where(eq(subscriptions.planId, id));
  if (Number(usage.total) > 0) throw new Error("Plan is assigned to subscriptions; deactivate it instead of deleting it");
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  await logAdminAction("delete", "subscription_plan", id, { name: existing.name }, null, null);
}

/**
 * List payment transactions (ADM-05)
 */
export async function listAdminPayments({
  status,
  page = 1,
  limit = 20,
}: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  const db = getDb();
  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));
  const offset = (page - 1) * limit;

  const where = status ? eq(paymentTransactions.status, status as any) : undefined;

  const [payments, total] = await Promise.all([
    db
      .select({
        id: paymentTransactions.id,
        amount: paymentTransactions.amount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        gateway: paymentTransactions.gateway,
        paidAt: paymentTransactions.paidAt,
        createdAt: paymentTransactions.createdAt,
        subscriptionId: paymentTransactions.subscriptionId,
      })
      .from(paymentTransactions)
      .where(where)
      .orderBy(sql`${paymentTransactions.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(paymentTransactions).where(where),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total: Number(total[0].total),
      totalPages: Math.ceil(Number(total[0].total) / limit),
    },
  };
}

/**
 * List system activity logs (ADM-06)
 */
export async function listAdminLogs({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  const db = getDb();
  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));
  const offset = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
        actorId: activityLogs.actorId,
      })
      .from(activityLogs)
      .orderBy(sql`${activityLogs.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(activityLogs),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total: Number(total[0].total),
      totalPages: Math.ceil(Number(total[0].total) / limit),
    },
  };
}
