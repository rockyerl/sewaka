"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { culturalRundowns } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export async function deleteRundownItemAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const rundownId = String(formData.get("rundownId") ?? "");

  if (!workspaceId || !rundownId) {
    throw new Error("Data tidak lengkap.");
  }

  await withWorkspace({ workspaceId }, async (tx) => {
    await tx
      .delete(culturalRundowns)
      .where(eq(culturalRundowns.id, rundownId));
  });

  revalidatePath("/events");
}
