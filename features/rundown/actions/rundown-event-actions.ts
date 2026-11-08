"use server";

import { revalidatePath } from "next/cache";
import { culturalRundowns } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

export async function createRundownWithEventAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const eventId = String(formData.get("eventId") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const ceremonyType = String(formData.get("ceremonyType") ?? "PROSESI").trim();
  const timeStart = String(formData.get("timeStart") ?? "08:00").trim();
  const timeEnd = String(formData.get("timeEnd") ?? "09:00").trim();
  const picName = String(formData.get("picName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const attire = String(formData.get("attire") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!workspaceId || !title) {
    throw new Error("Judul acara dan workspace harus diisi.");
  }

  await withWorkspace({ workspaceId }, async (tx) => {
    await tx.insert(culturalRundowns).values({
      workspaceId,
      eventId,
      title,
      ceremonyType,
      timeStart,
      timeEnd,
      picName: picName || null,
      location: location || null,
      attire: attire || null,
      notes: notes || null,
      rituals: [],
      sortOrder: 10,
    });
  });

  revalidatePath("/events");
}
