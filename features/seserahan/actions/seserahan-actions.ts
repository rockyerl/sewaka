"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { culturalSeserahanItems } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import {
  createSeserahanSchema,
  deleteSeserahanSchema,
  updateSeserahanStatusSchema,
} from "../actions/seserahan-schema";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function createSeserahanAction(formData: FormData) {
  const input = createSeserahanSchema.parse({
    workspaceId: formData.get("workspaceId"),
    boxNumber: formData.get("boxNumber") || 1,
    giverParty: formData.get("giverParty") || "GROOM_TO_BRIDE",
    title: formData.get("title"),
    category: formData.get("category") || "LAINNYA",
    estimatedCost: formData.get("estimatedCost") || "0",
    actualCost: formData.get("actualCost") || "0",
    status: formData.get("status") || "PLANNED",
    notes: formData.get("notes") || undefined,
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx.insert(culturalSeserahanItems).values({
        workspaceId: input.workspaceId,
        boxNumber: input.boxNumber,
        giverParty: input.giverParty,
        title: input.title,
        category: input.category,
        estimatedCost: input.estimatedCost,
        actualCost: input.actualCost,
        status: input.status,
        notes: input.notes ?? null,
      });
    }
  );

  revalidatePath("/seserahan");
  revalidatePath("/budget");
  revalidatePath("/budget/financial");
  revalidatePath("/dashboard");
}

export async function updateSeserahanStatusAction(formData: FormData) {
  const input = updateSeserahanStatusSchema.parse({
    workspaceId: formData.get("workspaceId"),
    itemId: formData.get("itemId"),
    status: formData.get("status"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .update(culturalSeserahanItems)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(culturalSeserahanItems.id, input.itemId),
            eq(culturalSeserahanItems.workspaceId, input.workspaceId)
          )
        );
    }
  );

  revalidatePath("/seserahan");
  revalidatePath("/budget");
  revalidatePath("/budget/financial");
  revalidatePath("/dashboard");
}

export async function deleteSeserahanAction(formData: FormData) {
  const input = deleteSeserahanSchema.parse({
    workspaceId: formData.get("workspaceId"),
    itemId: formData.get("itemId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .delete(culturalSeserahanItems)
        .where(
          and(
            eq(culturalSeserahanItems.id, input.itemId),
            eq(culturalSeserahanItems.workspaceId, input.workspaceId)
          )
        );
    }
  );

  revalidatePath("/seserahan");
  revalidatePath("/budget");
  revalidatePath("/budget/financial");
  revalidatePath("/dashboard");
}
