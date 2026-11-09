"use server";

import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import {
  culturalRundowns,
  culturalSeserahanItems,
  tasks,
} from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import {
  RUNDOWN_TEMPLATES,
  CHECKLIST_TEMPLATES,
  type CulturalTradition,
} from "@/lib/constants/cultural-templates";
import { CULTURAL_ENCYCLOPEDIA } from "@/lib/constants/cultural-encyclopedia";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const generateWorkflowSchema = z.object({
  workspaceId: z.string().uuid(),
  tradition: z.enum(["JAWA", "SUNDA", "MINANG", "NASIONAL"]),
});

export interface WorkflowGenerateResult {
  success: boolean;
  rundownCount: number;
  seserahanCount: number;
  taskCount: number;
  skipped: boolean;
  message: string;
}

/**
 * Generate lengkap workflow pernikahan dari template tradisi.
 * Auto-fill: rundown, seserahan, dan tasks.
 * Idempotent: skip jika sudah ada data untuk workspace ini.
 */
export async function generateCulturalWorkflowAction(
  workspaceId: string,
  tradition: CulturalTradition
): Promise<WorkflowGenerateResult> {
  const input = generateWorkflowSchema.parse({ workspaceId, tradition });

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const db = getDb();

      // Idempotent check: apakah sudah ada rundown untuk workspace ini?
      const [existingRundown] = await db
        .select({ count: count() })
        .from(culturalRundowns)
        .where(eq(culturalRundowns.workspaceId, input.workspaceId));

      if ((existingRundown?.count ?? 0) > 0) {
        return {
          success: false,
          rundownCount: 0,
          seserahanCount: 0,
          taskCount: 0,
          skipped: true,
          message:
            "Workflow untuk tradisi ini sudah pernah di-generate. Hapus data yang ada terlebih dahulu jika ingin generate ulang.",
        };
      }

      let rundownCount = 0;
      let seserahanCount = 0;
      let taskCount = 0;

      // 1. Generate Rundown dari template
      const rundownTemplates = RUNDOWN_TEMPLATES[input.tradition];
      if (rundownTemplates && rundownTemplates.length > 0) {
        for (const template of rundownTemplates) {
          await tx.insert(culturalRundowns).values({
            workspaceId: input.workspaceId,
            title: template.title,
            ceremonyType: template.ceremonyType,
            timeStart: template.timeStart,
            timeEnd: template.timeEnd,
            picName: template.picName,
            location: template.location,
            attire: template.attire,
            rituals: template.rituals,
            notes: template.notes,
            sortOrder: template.sortOrder,
          });
          rundownCount++;
        }
      }

      // 2. Generate Seserahan dari Encyclopedia Ubarampe
      const encyclopediaItems = CULTURAL_ENCYCLOPEDIA.filter(
        (article) => article.tradition === input.tradition
      );

      let boxNumber = 1;
      for (const article of encyclopediaItems) {
        for (const ubarampe of article.ubarampe) {
          await tx.insert(culturalSeserahanItems).values({
            workspaceId: input.workspaceId,
            boxNumber,
            giverParty: "GROOM_TO_BRIDE",
            title: ubarampe.name,
            category: "RITUAL",
            estimatedCost: "0",
            actualCost: "0",
            status: "PLANNED",
            notes: `"${ubarampe.meaning}" — dari prosesi ${article.title}`,
          });
          seserahanCount++;
          boxNumber++;
        }
      }

      // 3. Generate Tasks dari Checklist Templates
      const checklistTemplates = CHECKLIST_TEMPLATES[input.tradition];
      if (checklistTemplates && checklistTemplates.length > 0) {
        // Cek task yang sudah ada untuk avoid duplicates
        const existingTasks = await tx
          .select({ title: tasks.title })
          .from(tasks)
          .where(eq(tasks.workspaceId, input.workspaceId));

        const existingTitles = new Set(existingTasks.map((t) => t.title));

        for (const template of checklistTemplates) {
          const taskTitle = template.title;
          if (existingTitles.has(taskTitle)) continue;

          await tx.insert(tasks).values({
            workspaceId: input.workspaceId,
            title: taskTitle,
            description: template.description,
            status: "TODO",
            priority: template.priority,
            dueDate: null,
            categoryId: null,
            source: "CULTURAL_WORKFLOW",
          });
          taskCount++;
        }
      }

      revalidatePath("/rundown");
      revalidatePath("/seserahan");
      revalidatePath("/tasks");
      revalidatePath("/cultural-workflow");

      return {
        success: true,
        rundownCount,
        seserahanCount,
        taskCount,
        skipped: false,
        message: `Workflow berhasil di-generate! ${rundownCount} rundown, ${seserahanCount} seserahan, ${taskCount} tasks.`,
      };
    }
  );
}

/**
 * Reset workflow yang sudah di-generate (hapus semua data generated).
 * Digunakan jika user ingin generate ulang.
 */
export async function resetCulturalWorkflowAction(
  workspaceId: string
): Promise<{ success: boolean; message: string }> {
  const input = generateWorkflowSchema.parse({
    workspaceId,
    tradition: "JAWA",
  });

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: ["OWNER", "PARTNER"] },
    async () => {
      const db = getDb();

      await db
        .delete(culturalRundowns)
        .where(eq(culturalRundowns.workspaceId, input.workspaceId));

      await db
        .delete(culturalSeserahanItems)
        .where(eq(culturalSeserahanItems.workspaceId, input.workspaceId));

      // Hapus tasks yang di-generate dari cultural workflow
      await db
        .delete(tasks)
        .where(
          and(
            eq(tasks.workspaceId, input.workspaceId),
            eq(tasks.source, "CULTURAL_WORKFLOW"),
          ),
        );

      revalidatePath("/rundown");
      revalidatePath("/seserahan");
      revalidatePath("/tasks");
      revalidatePath("/cultural-workflow");

      return {
        success: true,
        message: "Workflow berhasil di-reset. Anda bisa generate ulang sekarang.",
      };
    }
  );
}

/**
 * Cek apakah workflow sudah pernah di-generate untuk workspace ini.
 */
export async function checkWorkflowStatusAction(
  workspaceId: string
): Promise<{ hasWorkflow: boolean; rundownCount: number }> {
  const input = generateWorkflowSchema.parse({
    workspaceId,
    tradition: "JAWA",
  });

  const db = getDb();

  const [result] = await db
    .select({ count: count() })
    .from(culturalRundowns)
    .where(eq(culturalRundowns.workspaceId, input.workspaceId));

  return {
    hasWorkflow: (result?.count ?? 0) > 0,
    rundownCount: result?.count ?? 0,
  };
}
