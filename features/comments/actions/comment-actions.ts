"use server";

import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";

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

  await getDb().insert(comments).values({
    workspaceId,
    targetId: input.targetId,
    targetType: input.targetType,
    userId: session.user.id,
    content: input.content,
    parentId: input.parentId,
  });

  revalidatePath(`/workspace/${workspaceId}`);
}

export async function getCommentsAction(
  workspaceId: string,
  targetId: string,
  targetType: "TASK" | "EVENT" | "DOCUMENT" | "VENDOR",
) {
  const result = await getDb()
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
    .orderBy(asc(comments.createdAt));

  return result;
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  await getDb().delete(comments).where(eq(comments.id, commentId));
  revalidatePath("/");
}
