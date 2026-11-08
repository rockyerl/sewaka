"use server";

import { auth } from "@/lib/actions/auth";
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = createAdminContentSchema.parse(data);
  const db = await getDb();
  const [result] = await db
    .insert(adminContents)
    .values({
      ...parsed,
      createdBy: session.user.id,
    })
    .returning();

  return result;
}

export async function updateAdminContentAction(id: string, data: Partial<typeof adminContents.$inferInsert>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const [result] = await db
    .update(adminContents)
    .set(data)
    .where(eq(adminContents.id, id))
    .returning();

  return result;
}

export async function deleteAdminContentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  await db
    .delete(adminContents)
    .where(eq(adminContents.id, id));
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const [result] = await db
    .update(adminContents)
    .set({ isActive })
    .where(eq(adminContents.id, id))
    .returning();

  return result;
}
