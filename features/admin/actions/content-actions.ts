"use server";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { logAdminAction } from "@/features/admin/lib/audit";
import { getDb } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { adminContents } from "@/lib/db/schema";
import { z } from "zod";

const createAdminContentSchema = z.object({
  type: z.enum(["LANDING_PAGE", "FAQ", "BLOG", "TESTIMONIAL", "PARTNER"]),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function createAdminContentAction(data: z.infer<typeof createAdminContentSchema>) {
  const { userId } = await requireAdmin();

  const parsed = createAdminContentSchema.parse(data);
  const db = await getDb();
  const [result] = await db
    .insert(adminContents)
    .values({
      ...parsed,
      createdBy: userId,
    })
    .returning();

  await logAdminAction("create", "content", result.id, null, { type: result.type, title: result.title, slug: result.slug }, null);
  return result;
}

export async function updateAdminContentAction(id: string, data: Partial<typeof adminContents.$inferInsert>) {
  await requireAdmin();
  const parsed = z.object({
    type: z.enum(["LANDING_PAGE", "FAQ", "BLOG", "TESTIMONIAL", "PARTNER"]).optional(),
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.record(z.string(), z.any()).optional(),
    metadata: z.record(z.string(), z.any()).nullable().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }).strict().parse(data);

  const db = await getDb();
  const [existing] = await db.select().from(adminContents).where(eq(adminContents.id, id)).limit(1);
  if (!existing) throw new Error("Content not found");
  const [result] = await db
    .update(adminContents)
    .set(parsed)
    .where(eq(adminContents.id, id))
    .returning();

  await logAdminAction("update", "content", id, { title: existing.title, slug: existing.slug, isActive: existing.isActive }, parsed, null);
  return result;
}

export async function deleteAdminContentAction(id: string) {
  await requireAdmin();

  const db = await getDb();
  const [existing] = await db.select().from(adminContents).where(eq(adminContents.id, id)).limit(1);
  if (!existing) throw new Error("Content not found");
  await db
    .delete(adminContents)
    .where(eq(adminContents.id, id));
  await logAdminAction("delete", "content", id, { title: existing.title, slug: existing.slug }, null, null);
}

export async function getAdminContentAction(slug: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(adminContents)
    .where(and(
      eq(adminContents.slug, slug),
      eq(adminContents.isActive, true)
    ))
    .limit(1);

  return result;
}

export async function listAdminContentsAction(type?: string) {
  await requireAdmin();

  const db = await getDb();
  if (type) {
    return db
      .select()
      .from(adminContents)
      .where(eq(adminContents.type, type))
      .orderBy(desc(adminContents.sortOrder), desc(adminContents.createdAt));
  }

  return db
    .select()
    .from(adminContents)
    .orderBy(desc(adminContents.sortOrder), desc(adminContents.createdAt));
}

export async function toggleAdminContentActiveAction(id: string, isActive: boolean) {
  await requireAdmin();
  if (typeof isActive !== "boolean") throw new Error("Invalid content status");

  const db = await getDb();
  const [existing] = await db.select().from(adminContents).where(eq(adminContents.id, id)).limit(1);
  if (!existing) throw new Error("Content not found");
  const [result] = await db
    .update(adminContents)
    .set({ isActive })
    .where(eq(adminContents.id, id))
    .returning();

  await logAdminAction("update", "content", id, { isActive: existing.isActive }, { isActive }, null);
  return result;
}
