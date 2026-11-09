"use server";

import { eq, asc, desc, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { featureFlags, systemSettings, adminAuditLogs, announcements } from "@/lib/db/schema";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { logAdminAction } from "@/features/admin/lib/audit";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ===== ADMIN AUDIT LOG HELPER =====

// ===== FEATURE FLAGS =====

export async function getFeatureFlags() {
  await requireAdmin();
  const db = getDb();
  const flags = await db.select().from(featureFlags).orderBy(asc(featureFlags.name));
  return flags;
}

export async function getFeatureFlagValues() {
  const db = getDb();
  return db.select({ name: featureFlags.name, isEnabled: featureFlags.isEnabled }).from(featureFlags);
}

async function findFeatureFlag(name: string) {
  const db = getDb();
  const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  return flag;
}

export async function getFeatureFlag(name: string) {
  await requireAdmin();
  return findFeatureFlag(name);
}

export async function isFeatureEnabled(name: string) {
  const flag = await findFeatureFlag(name);
  return flag?.isEnabled ?? false;
}

export async function updateFeatureFlagAction(name: string, data: any) {
  await requireAdmin();
  if (!name) throw new Error("Invalid feature flag update");
  const parsed = z.object({
    isEnabled: z.boolean().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    scope: z.enum(["global", "workspace", "user"]).optional(),
  }).strict().refine((value) => Object.keys(value).length > 0).parse(data);

  const db = getDb();
  const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  if (!existing) throw new Error("Feature flag not found");

  const oldValue = { isEnabled: existing.isEnabled, scope: existing.scope, description: existing.description };
  
  await db.update(featureFlags)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(featureFlags.id, existing.id));

  await logAdminAction("update", "feature_flag", existing.id, oldValue, parsed, null);
  
  const [updated] = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  return updated;
}

export async function createFeatureFlagAction(name: string, data: any) {
  const { userId } = await requireAdmin();
  if (!/^[a-z][a-z0-9_]{1,79}$/.test(name)) throw new Error("Invalid feature flag name");
  if (!data || !["global", "workspace", "user"].includes(data.scope)) throw new Error("Invalid feature flag scope");

  const db = getDb();
  const result = await db.insert(featureFlags).values({
    name,
    description: typeof data.description === "string" ? data.description : null,
    scope: data.scope,
    isEnabled: false,
    createdBy: userId,
  }).returning();

  await logAdminAction("create", "feature_flag", result[0].id, null, { name, ...data }, null);
  return result[0];
}

export async function deleteFeatureFlagAction(id: string) {
  await requireAdmin();

  const db = getDb();
  const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.id, id)).limit(1);
  if (!existing) throw new Error("Feature flag not found");

  await db.delete(featureFlags).where(eq(featureFlags.id, id));
  await logAdminAction("delete", "feature_flag", id, { name: existing.name }, null, null);
  return { success: true };
}

// ===== SYSTEM SETTINGS =====

export async function getSystemSettings() {
  await requireAdmin();
  const db = getDb();
  const settings = await db.select().from(systemSettings).orderBy(asc(systemSettings.key));
  return settings;
}

export async function getSystemSetting(key: string) {
  await requireAdmin();
  const db = getDb();
  const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return setting;
}

export async function updateSystemSettingAction(key: string, data: any) {
  const { userId } = await requireAdmin();
  if (!key || !data || !("value" in data)) throw new Error("Invalid system setting update");

  const db = getDb();
  const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  
  if (existing) {
    const oldValue = { value: existing.value };
    await db.update(systemSettings)
      .set({ value: data.value, updatedBy: userId, updatedAt: new Date() })
      .where(eq(systemSettings.id, existing.id));
    await logAdminAction("update", "system_setting", existing.id, oldValue, data, null);
  } else {
    await db.insert(systemSettings).values({
      key,
      ...data,
      updatedBy: userId,
    });
    await logAdminAction("create", "system_setting", null, null, data, `Created setting ${key}`);
  }

  const [updated] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  revalidatePath("/admin/settings");
  return updated;
}

// ===== ADMIN AUDIT LOGS =====

export async function getAdminAuditLogs({ page = 1, limit = 50, action, entityType }: { page?: number; limit?: number; action?: string | null; entityType?: string | null } = {}) {
  await requireAdmin();
  const db = getDb();
  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));
  const offset = (page - 1) * limit;
  
  const conditions = [];
  if (action) conditions.push(eq(adminAuditLogs.action, action));
  if (entityType) conditions.push(eq(adminAuditLogs.entityType, entityType));
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const logs = await db.select().from(adminAuditLogs)
    .where(where)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return logs;
}

// ===== ANNOUNCEMENTS =====

export async function getAnnouncements() {
  await requireAdmin();
  const db = getDb();
  const items = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  return items;
}

export async function getActiveAnnouncements() {
  const db = getDb();
  const now = new Date();
  const items = await db.select().from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt));
  
  return items.filter(a => {
    if (a.startDate && a.startDate > now) return false;
    if (a.endDate && a.endDate < now) return false;
    return true;
  });
}

export async function createAnnouncementAction(data: any) {
  const { userId } = await requireAdmin();
  if (!data || typeof data.title !== "string" || !data.title.trim() || typeof data.content !== "string" || !data.content.trim()) throw new Error("Title and content are required");
  if (!["info", "warning", "error", "maintenance"].includes(data.type)) throw new Error("Invalid announcement type");
  if (!["all", "user", "admin"].includes(data.targetAudience)) throw new Error("Invalid announcement audience");

  const db = getDb();
  const result = await db.insert(announcements).values({
    title: data.title.trim(),
    content: data.content.trim(),
    type: data.type,
    targetAudience: data.targetAudience,
    isActive: false,
    createdBy: userId,
  }).returning();

  await logAdminAction("create", "announcement", result[0].id, null, data, null);
  return result[0];
}

export async function updateAnnouncementAction(id: string, data: any) {
  await requireAdmin();
  if (!id) throw new Error("Announcement ID is required");
  const parsed = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).max(10000).optional(),
    type: z.enum(["info", "warning", "error", "maintenance"]).optional(),
    targetAudience: z.enum(["all", "user", "admin", "workspace"]).optional(),
    isActive: z.boolean().optional(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
  }).strict().refine((value) => Object.keys(value).length > 0).parse(data);

  const db = getDb();
  const [existing] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  if (!existing) throw new Error("Announcement not found");

  const oldValue = { ...existing };
  await db.update(announcements)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(announcements.id, id));

  await logAdminAction("update", "announcement", id, oldValue, parsed, null);
  
  const [updated] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return updated;
}

export async function deleteAnnouncementAction(id: string) {
  await requireAdmin();

  const db = getDb();
  const [existing] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  if (!existing) throw new Error("Announcement not found");
  await db.delete(announcements).where(eq(announcements.id, id));
  await logAdminAction("delete", "announcement", id, { title: existing.title }, null, null);
  return { success: true };
}

export async function toggleAnnouncementAction(id: string, isActive: boolean) {
  await requireAdmin();
  if (typeof isActive !== "boolean") throw new Error("Invalid announcement status");
  return updateAnnouncementAction(id, { isActive });
}
