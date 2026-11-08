import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { imageGallery } from "@/lib/db/schema";

export async function listWorkspaceImages(workspaceId: string) {
  const db = await getDb();
  return db.select().from(imageGallery).where(eq(imageGallery.workspaceId, workspaceId)).orderBy(desc(imageGallery.createdAt));
}
