"use server";

import { auth } from "@/lib/actions/auth";
import { and, eq } from "drizzle-orm";
import { expenseAttachments, expenses } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { z } from "zod";
import { deleteFile } from "@/lib/utils/storage";
import { checkStorageLimit } from "@/lib/utils/subscription-check";

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
  await checkStorageLimit(parsed.workspaceId, parsed.fileSize);
  return withWorkspace(
    { workspaceId: parsed.workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [expense] = await tx.select({ id: expenses.id }).from(expenses).where(
        and(eq(expenses.id, parsed.expenseId), eq(expenses.workspaceId, parsed.workspaceId)),
      ).limit(1);
      if (!expense) throw new Error("Pengeluaran tidak ditemukan.");
      const [result] = await tx
        .insert(expenseAttachments)
        .values({ ...parsed, uploadedBy: session.user.id })
        .returning();
      return result;
    },
  );
}

export async function deleteExpenseAttachmentAction(id: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [attachment] = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [row] = await tx.select().from(expenseAttachments).where(
        and(eq(expenseAttachments.id, id), eq(expenseAttachments.workspaceId, workspaceId)),
      ).limit(1);
      if (row) {
        await tx.delete(expenseAttachments).where(
          and(eq(expenseAttachments.id, id), eq(expenseAttachments.workspaceId, workspaceId)),
        );
      }
      return [row] as const;
    },
  );

  // Delete from cloud storage
  if (attachment && attachment.fileUrl) {
    await deleteFile(attachment.fileUrl);
  }

}

export async function listExpenseAttachmentsAction(expenseId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return withWorkspace({ workspaceId }, (tx) =>
    tx.select().from(expenseAttachments).where(
      and(eq(expenseAttachments.expenseId, expenseId), eq(expenseAttachments.workspaceId, workspaceId)),
    ),
  );
}
