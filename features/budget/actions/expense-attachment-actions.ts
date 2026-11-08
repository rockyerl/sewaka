"use server";

import { auth } from "@/lib/actions/auth";
import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { expenseAttachments } from "@/lib/db/schema";
import { z } from "zod";
import { deleteFile } from "@/lib/utils/storage";
import { checkStorageLimit, SubscriptionLimitError } from "@/lib/utils/subscription-check";

const uploadExpenseAttachmentSchema = z.object({
  expenseId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
});

export async function uploadExpenseAttachmentAction(data: z.infer<typeof uploadExpenseAttachmentSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = uploadExpenseAttachmentSchema.parse(data);

  // Check subscription storage limit
  try {
    await checkStorageLimit(parsed.workspaceId, parsed.fileSize);
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
  }

  const db = await getDb();
  const [result] = await db
    .insert(expenseAttachments)
    .values({
      ...parsed,
      uploadedBy: session.user.id,
    })
    .returning();

  return result;
}

export async function deleteExpenseAttachmentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  const [attachment] = await db
    .select()
    .from(expenseAttachments)
    .where(eq(expenseAttachments.id, id))
    .limit(1);

  // Delete from cloud storage
  if (attachment && attachment.fileUrl) {
    await deleteFile(attachment.fileUrl);
  }

  await db
    .delete(expenseAttachments)
    .where(eq(expenseAttachments.id, id));
}

export async function listExpenseAttachmentsAction(expenseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const db = await getDb();
  return db
    .select()
    .from(expenseAttachments)
    .where(eq(expenseAttachments.expenseId, expenseId));
}
