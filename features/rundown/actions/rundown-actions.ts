"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { culturalRundowns, weddingWorkspaces } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";
import {
  CULTURAL_TRADITIONS,
  type CulturalTradition,
} from "@/lib/cultural-templates";

export async function createRundownItemAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const ceremonyType = String(formData.get("ceremonyType") ?? "PROSESI").trim();
  const timeStart = String(formData.get("timeStart") ?? "08:00").trim();
  const timeEnd = String(formData.get("timeEnd") ?? "09:00").trim();
  const picName = String(formData.get("picName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const attire = String(formData.get("attire") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const ritualName = String(formData.get("ritualName") ?? "").trim();
  const ritualMeaning = String(formData.get("ritualMeaning") ?? "").trim();
  const ritualEquip = String(formData.get("ritualEquip") ?? "").trim();

  if (!workspaceId || !title) {
    throw new Error("Judul acara dan workspace harus diisi.");
  }

  const rituals = ritualName
    ? [
        {
          name: ritualName,
          meaning: ritualMeaning,
          equipment: ritualEquip
            ? ritualEquip.split(",").map((s) => s.trim())
            : [],
        },
      ]
    : [];

  await withWorkspace({ workspaceId }, async (tx) => {
    await tx.insert(culturalRundowns).values({
      workspaceId,
      title,
      ceremonyType,
      timeStart,
      timeEnd,
      picName: picName || null,
      location: location || null,
      attire: attire || null,
      notes: notes || null,
      rituals,
      sortOrder: 10,
    });
  });

  revalidatePath("/events");
}

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

export async function applyCulturalTemplateAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const tradition = String(formData.get("tradition") ?? "JAWA") as CulturalTradition;

  if (!workspaceId) {
    throw new Error("WorkspaceId wajib diisi.");
  }

  const traditionInfo = CULTURAL_TRADITIONS[tradition] ?? CULTURAL_TRADITIONS.JAWA;

  await withWorkspace({ workspaceId }, async (tx) => {
    // Update workspace tradition
    await tx
      .update(weddingWorkspaces)
      .set({
        culturalTradition: tradition,
        invitationQuote: traditionInfo.tagline,
        dressCode: traditionInfo.primaryAttire,
      })
      .where(eq(weddingWorkspaces.id, workspaceId));

    // Delete existing rundowns and seed new template
    await tx
      .delete(culturalRundowns)
      .where(eq(culturalRundowns.workspaceId, workspaceId));

    for (const item of traditionInfo.rundownTemplate) {
      await tx.insert(culturalRundowns).values({
        workspaceId,
        title: item.title,
        ceremonyType: item.ceremonyType,
        timeStart: item.timeStart,
        timeEnd: item.timeEnd,
        picName: item.picName,
        location: item.location,
        attire: item.attire,
        rituals: item.rituals,
        notes: item.notes,
        sortOrder: item.sortOrder,
      });
    }
  });

  revalidatePath("/events");
  revalidatePath("/dashboard");
}

export async function updateInvitationSettingsAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const invitationSlug = String(formData.get("invitationSlug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const invitationQuote = String(formData.get("invitationQuote") ?? "").trim();
  const dressCode = String(formData.get("dressCode") ?? "").trim();
  const story = String(formData.get("story") ?? "").trim();

  if (!workspaceId || !invitationSlug) {
    throw new Error("Slug undangan tidak boleh kosong.");
  }

  await withWorkspace({ workspaceId }, async (tx) => {
    await tx
      .update(weddingWorkspaces)
      .set({
        invitationSlug,
        invitationQuote: invitationQuote || null,
        dressCode: dressCode || null,
        story: story || null,
      })
      .where(eq(weddingWorkspaces.id, workspaceId));
  });

  revalidatePath("/guests");
  revalidatePath("/events");
}

export async function getCulturalRundownsAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, async (tx) => {
    return tx
      .select()
      .from(culturalRundowns)
      .where(eq(culturalRundowns.workspaceId, workspaceId));
  });
}
