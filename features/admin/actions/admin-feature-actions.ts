"use server";

import { eq, asc, desc, and } from "drizzle-orm";
import { getDb } from "@/db";
import { featureFlags, systemSettings, adminAuditLogs, announcements } from "@/db/schema";
import { auth } from "@/auth";

// ===== ADMIN AUDIT LOG HELPER =====

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string | null,
  oldValue: any,
  newValue: any,
  notes: string | null
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;
    
    const db = getDb();
    await db.insert(adminAuditLogs).values({
      adminId: session.user.id,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      notes,
    });
  } catch {
    // Don't fail the main action if audit log fails
  }
}

// ===== FEATURE FLAGS =====

export async function getFeatureFlags() {
  const db = getDb();
  const flags = await db.select().from(featureFlags).orderBy(asc(featureFlags.name));
  return flags;
}

export async function getFeatureFlag(name: string) {
  const db = getDb();
  const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  return flag;
}

export async function isFeatureEnabled(name: string) {
  const flag = await getFeatureFlag(name);
  return flag?.isEnabled ?? false;
}

export async function updateFeatureFlagAction(name: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  if (!existing) throw new Error("Feature flag not found");

  const oldValue = { isEnabled: existing.isEnabled };
  
  await db.update(featureFlags)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(featureFlags.id, existing.id));

  await logAdminAction("update", "feature_flag", existing.id, oldValue, data, null);
  
  const [updated] = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  return updated;
}

export async function createFeatureFlagAction(name: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  const result = await db.insert(featureFlags).values({
    name,
    ...data,
    createdBy: session.user.id,
  }).returning();

  await logAdminAction("create", "feature_flag", result[0].id, null, { name, ...data }, null);
  return result[0];
}

export async function deleteFeatureFlagAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.id, id)).limit(1);
  if (!existing) throw new Error("Feature flag not found");

  await db.delete(featureFlags).where(eq(featureFlags.id, id));
  await logAdminAction("delete", "feature_flag", id, { name: existing.name }, null, null);
  return { success: true };
}

// ===== SYSTEM SETTINGS =====

export async function getSystemSettings() {
  const db = getDb();
  const settings = await db.select().from(systemSettings).orderBy(asc(systemSettings.key));
  return settings;
}

export async function getSystemSetting(key: string) {
  const db = getDb();
  const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return setting;
}

export async function updateSystemSettingAction(key: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  
  if (existing) {
    const oldValue = { value: existing.value };
    await db.update(systemSettings)
      .set({ ...data, updatedBy: session.user.id, updatedAt: new Date() })
      .where(eq(systemSettings.id, existing.id));
    await logAdminAction("update", "system_setting", existing.id, oldValue, data, null);
  } else {
    await db.insert(systemSettings).values({
      key,
      ...data,
      updatedBy: session.user.id,
    });
    await logAdminAction("create", "system_setting", key, null, data, null);
  }

  const [updated] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return updated;
}

// ===== ADMIN AUDIT LOGS =====

export async function getAdminAuditLogs({ page = 1, limit = 50, action, entityType }: { page?: number; limit?: number; action?: string | null; entityType?: string | null } = {}) {
  const db = getDb();
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  const result = await db.insert(announcements).values({
    ...data,
    createdBy: session.user.id,
  }).returning();

  await logAdminAction("create", "announcement", result[0].id, null, data, null);
  return result[0];
}

export async function updateAnnouncementAction(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  const [existing] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  if (!existing) throw new Error("Announcement not found");

  const oldValue = { ...existing };
  await db.update(announcements)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(announcements.id, id));

  await logAdminAction("update", "announcement", id, oldValue, data, null);
  
  const [updated] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return updated;
}

export async function deleteAnnouncementAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = getDb();
  await db.delete(announcements).where(eq(announcements.id, id));
  await logAdminAction("delete", "announcement", id, null, null, null);
  return { success: true };
}

export async function toggleAnnouncementAction(id: string, isActive: boolean) {
  return updateAnnouncementAction(id, { isActive });
}
