"use server";

import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { weddingConcepts } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export const updateWeddingConceptSchema = z.object({
  theme: z.string().max(100).optional(),
  colorPalette: z.array(z.string().max(7)).max(10).optional(),
  moodboardImages: z.array(z.string().url()).max(20).optional(),
  description: z.string().max(1000).optional(),
});

export async function updateWeddingConceptAction(
  workspaceId: string,
  data: z.input<typeof updateWeddingConceptSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const input = updateWeddingConceptSchema.parse(data);

  await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
    const existing = await tx
      .select()
      .from(weddingConcepts)
      .where(eq(weddingConcepts.workspaceId, workspaceId))
      .limit(1);

    if (existing.length > 0) {
      await tx
        .update(weddingConcepts)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(weddingConcepts.workspaceId, workspaceId));
    } else {
      await tx.insert(weddingConcepts).values({
        workspaceId,
        ...input,
      });
    }
    },
  );

  revalidatePath("/workspaces");
}

export async function getWeddingConceptAction(workspaceId: string) {
  const result = await withWorkspace({ workspaceId }, (tx) => tx
    .select()
    .from(weddingConcepts)
    .where(eq(weddingConcepts.workspaceId, workspaceId))
    .limit(1));

  return result[0] ?? null;
}
