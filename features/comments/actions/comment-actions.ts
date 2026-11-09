"use server";

import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

import { comments, users, tasks, weddingEvents, documents, vendors } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export const createCommentSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(["TASK", "EVENT", "DOCUMENT", "VENDOR"]),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

export async function createCommentAction(
  workspaceId: string,
  data: z.input<typeof createCommentSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const input = createCommentSchema.parse(data);

  await withWorkspace({ workspaceId }, async (tx) => {
    const targetTable = {
      TASK: tasks,
      EVENT: weddingEvents,
      DOCUMENT: documents,
      VENDOR: vendors,
    }[input.targetType];
    const targetWorkspaceColumn = targetTable.workspaceId;
    const [target] = await tx.select({ id: targetTable.id }).from(targetTable).where(
      and(eq(targetTable.id, input.targetId), eq(targetWorkspaceColumn, workspaceId)),
    ).limit(1);
    if (!target) throw new Error("Objek komentar tidak ditemukan.");

    if (input.parentId) {
      const [parent] = await tx.select({ id: comments.id }).from(comments).where(and(
        eq(comments.id, input.parentId),
        eq(comments.workspaceId, workspaceId),
        eq(comments.targetId, input.targetId),
        eq(comments.targetType, input.targetType),
      )).limit(1);
      if (!parent) throw new Error("Komentar induk tidak ditemukan.");
    }

    await tx.insert(comments).values({
      workspaceId,
      targetId: input.targetId,
      targetType: input.targetType,
      userId: session.user.id,
      content: input.content,
      parentId: input.parentId,
    });
  });

  revalidatePath(`/workspace/${workspaceId}`);
}

export async function getCommentsAction(
  workspaceId: string,
  targetId: string,
  targetType: "TASK" | "EVENT" | "DOCUMENT" | "VENDOR",
) {
  return withWorkspace({ workspaceId }, (tx) => tx
    .select({
      id: comments.id,
      content: comments.content,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      userName: users.name,
      userId: users.id,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.workspaceId, workspaceId),
        eq(comments.targetId, targetId),
        eq(comments.targetType, targetType),
      ),
    )
    .orderBy(asc(comments.createdAt)));
}

export async function deleteCommentAction(commentId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  await withWorkspace({ workspaceId }, async (tx) => {
    const deleted = await tx.delete(comments).where(and(
      eq(comments.id, commentId),
      eq(comments.workspaceId, workspaceId),
      eq(comments.userId, session.user.id),
    )).returning({ id: comments.id });
    if (!deleted.length) throw new Error("Komentar tidak ditemukan atau bukan milik Anda.");
  });
  revalidatePath("/");
}
