"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { tasks } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const importUbarampeSchema = z.object({
  workspaceId: z.string().uuid(),
  ritualTitle: z.string().min(1),
  items: z.array(z.string().min(1)),
});

export async function importUbarampeToTasksAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const ritualTitle = String(formData.get("ritualTitle") ?? "");
  const itemsJson = String(formData.get("items") ?? "[]");

  let parsedItems: string[] = [];
  try {
    parsedItems = JSON.parse(itemsJson);
  } catch {
    parsedItems = [];
  }

  const input = importUbarampeSchema.parse({
    workspaceId,
    ritualTitle,
    items: parsedItems,
  });

  if (input.items.length === 0) {
    throw new Error("Pilih setidaknya satu peranti ubarampe untuk dijadikan tugas.");
  }

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      for (const itemName of input.items) {
        await tx.insert(tasks).values({
          workspaceId: input.workspaceId,
          title: `Siapkan Ubarampe: ${itemName} (${input.ritualTitle})`,
          description: `Perlengkapan ritual adat untuk prosesi ${input.ritualTitle}. Pastikan kondisi bersih, segar, dan sesuai pakem tradisi.`,
          status: "TODO",
          priority: "HIGH",
        });
      }
    }
  );

  revalidatePath("/tasks");
  revalidatePath("/encyclopedia");
  return { success: true, count: input.items.length };
}
