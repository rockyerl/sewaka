"use server";

import { eq, and, count, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  users,
  weddingWorkspaces,
  workspaceMembers,
  subscriptionPlans,
  subscriptions,
  paymentTransactions,
  activityLogs,
  tasks,
  guests,
  vendors,
  expenses,
} from "@/lib/db/schema";

/**
 * Get admin dashboard statistics (ADM-01)
 */
export async function getAdminStats() {
  const db = getDb();

  const [userStats, workspaceStats, subscriptionStats, paymentStats] = await Promise.all([
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
  ]);

  return {
    totalUsers: Number(userStats[0].total),
    totalWorkspaces: Number(workspaceStats[0].total),
    totalSubscriptions: Number(subscriptionStats[0].total),
    activeSubscriptions: Number(subscriptionStats[0].active),
    totalRevenue: Number(paymentStats[0].total),
    totalTransactions: Number(paymentStats[0].count),
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
  const db = getDb();
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
  const db = getDb();
  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));
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
  const db = getDb();
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
  const db = getDb();

  return db
    .select()
    .from(subscriptionPlans)
    .orderBy(subscriptionPlans.sortOrder);
}

/**
 * Create subscription plan (ADM-04)
 */
export async function createPlanAction(formData: FormData) {
  const db = getDb();

  const values = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    price: formData.get("price") as string,
    currency: (formData.get("currency") as string) || "IDR",
    durationMonths: formData.get("durationMonths") ? Number(formData.get("durationMonths")) : null,
    maxVendors: formData.get("maxVendors") ? Number(formData.get("maxVendors")) : null,
    maxGuests: formData.get("maxGuests") ? Number(formData.get("maxGuests")) : null,
    maxStorageBytes: formData.get("maxStorageBytes") ? Number(formData.get("maxStorageBytes")) : null,
    features: formData.get("features") ? JSON.parse(formData.get("features") as string) : null,
    isActive: formData.get("isActive") === "true" ? "true" : "false",
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  };

  const [result] = await db.insert(subscriptionPlans).values(values).returning();
  return result;
}

/**
 * Update subscription plan (ADM-04)
 */
export async function updatePlanAction(id: string, formData: FormData) {
  const db = getDb();

  const values = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    price: formData.get("price") as string,
    currency: (formData.get("currency") as string) || "IDR",
    durationMonths: formData.get("durationMonths") ? Number(formData.get("durationMonths")) : null,
    maxVendors: formData.get("maxVendors") ? Number(formData.get("maxVendors")) : null,
    maxGuests: formData.get("maxGuests") ? Number(formData.get("maxGuests")) : null,
    maxStorageBytes: formData.get("maxStorageBytes") ? Number(formData.get("maxStorageBytes")) : null,
    features: formData.get("features") ? JSON.parse(formData.get("features") as string) : null,
    isActive: formData.get("isActive") === "true" ? "true" : "false",
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  };

  const [result] = await db
    .update(subscriptionPlans)
    .set(values)
    .where(eq(subscriptionPlans.id, id))
    .returning();

  return result;
}

/**
 * Delete subscription plan (ADM-04)
 */
export async function deletePlanAction(id: string) {
  const db = getDb();
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
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
  const db = getDb();
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
  const db = getDb();
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
