"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import { createWorkspace } from "../queries";
import { createWorkspaceSchema } from "../schemas/workspace";

export async function createWorkspaceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu untuk membuat workspace.");
  }

  const input = createWorkspaceSchema.parse({
    name: String(formData.get("name") ?? ""),
    coupleOne: String(formData.get("coupleOne") ?? ""),
    coupleTwo: String(formData.get("coupleTwo") ?? ""),
    weddingDate: String(formData.get("weddingDate") ?? "") || undefined,
    location: String(formData.get("location") ?? ""),
    culturalTradition: String(formData.get("culturalTradition") ?? "JAWA"),
  });

  await createWorkspace(input);
  revalidatePath("/");
}
