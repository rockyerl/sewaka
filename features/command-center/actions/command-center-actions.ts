"use server";

import { eq, and, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { commandCenterTeam, commandCenterIncidents } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const createTeamMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1),
  role: z.string().min(1),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
});

const updateTeamStatusSchema = z.object({
  memberId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  status: z.enum(["ON_TIME", "DELAYED", "COMPLETED", "ISSUE"]),
  notes: z.string().optional(),
});

const createIncidentSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  reportedBy: z.string().optional(),
});

const updateIncidentStatusSchema = z.object({
  incidentId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  resolvedBy: z.string().optional(),
});

/**
 * Tambah anggota tim ke command center.
 */
export async function createTeamMemberAction(data: {
  workspaceId: string;
  name: string;
  role: string;
  phoneNumber?: string;
  notes?: string;
}): Promise<{ success: boolean; memberId?: string; error?: string }> {
  const input = createTeamMemberSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const [newMember] = await tx
        .insert(commandCenterTeam)
        .values({
          workspaceId: input.workspaceId,
          name: input.name,
          role: input.role,
          phoneNumber: input.phoneNumber ?? null,
          notes: input.notes ?? null,
        })
        .returning({ id: commandCenterTeam.id });

      revalidatePath("/command-center");

      return {
        success: true,
        memberId: newMember?.id,
      };
    }
  );
}

/**
 * Update status anggota tim.
 */
export async function updateTeamStatusAction(data: {
  memberId: string;
  workspaceId: string;
  status: "ON_TIME" | "DELAYED" | "COMPLETED" | "ISSUE";
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const input = updateTeamStatusSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const updates: Record<string, unknown> = {
        status: input.status,
      };
      if (input.notes !== undefined) {
        updates.notes = input.notes;
      }

      await tx
        .update(commandCenterTeam)
        .set(updates)
        .where(
          and(
            eq(commandCenterTeam.id, input.memberId),
            eq(commandCenterTeam.workspaceId, input.workspaceId)
          )
        );

      revalidatePath("/command-center");

      return { success: true };
    }
  );
}

/**
 * Hapus anggota tim.
 */
export async function deleteTeamMemberAction(
  memberId: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }> {
  return withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER"] },
    async (tx) => {
      await tx
        .delete(commandCenterTeam)
        .where(
          and(
            eq(commandCenterTeam.id, memberId),
            eq(commandCenterTeam.workspaceId, workspaceId)
          )
        );

      revalidatePath("/command-center");

      return { success: true };
    }
  );
}

/**
 * Report insiden baru.
 */
export async function createIncidentAction(data: {
  workspaceId: string;
  title: string;
  description?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reportedBy?: string;
}): Promise<{ success: boolean; incidentId?: string; error?: string }> {
  const input = createIncidentSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const [newIncident] = await tx
        .insert(commandCenterIncidents)
        .values({
          workspaceId: input.workspaceId,
          title: input.title,
          description: input.description ?? null,
          severity: input.severity,
          reportedBy: input.reportedBy ?? null,
        })
        .returning({ id: commandCenterIncidents.id });

      revalidatePath("/command-center");

      return {
        success: true,
        incidentId: newIncident?.id,
      };
    }
  );
}

/**
 * Update status insiden.
 */
export async function updateIncidentStatusAction(data: {
  incidentId: string;
  workspaceId: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  resolvedBy?: string;
}): Promise<{ success: boolean; error?: string }> {
  const input = updateIncidentStatusSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const updates: Record<string, unknown> = {
        status: input.status,
      };
      if (input.status === "RESOLVED") {
        updates.resolvedAt = new Date();
        if (input.resolvedBy) {
          updates.resolvedBy = input.resolvedBy;
        }
      }

      await tx
        .update(commandCenterIncidents)
        .set(updates)
        .where(
          and(
            eq(commandCenterIncidents.id, input.incidentId),
            eq(commandCenterIncidents.workspaceId, input.workspaceId)
          )
        );

      revalidatePath("/command-center");

      return { success: true };
    }
  );
}

/**
 * Get semua anggota tim untuk command center.
 */
export async function getCommandCenterTeamAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, (db) => db
    .select()
    .from(commandCenterTeam)
    .where(eq(commandCenterTeam.workspaceId, workspaceId))
    .orderBy(commandCenterTeam.role, commandCenterTeam.name));
}

/**
 * Get semua insiden untuk command center.
 */
export async function getCommandCenterIncidentsAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, (db) => db
    .select()
    .from(commandCenterIncidents)
    .where(eq(commandCenterIncidents.workspaceId, workspaceId))
    .orderBy(desc(commandCenterIncidents.createdAt)));
}

/**
 * Get stats untuk command center dashboard.
 */
export async function getCommandCenterStatsAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, async (db) => {
  const [teamStats] = await db
    .select({
      total: count(),
      onTime: count(eq(commandCenterTeam.status, "ON_TIME")),
      delayed: count(eq(commandCenterTeam.status, "DELAYED")),
      completed: count(eq(commandCenterTeam.status, "COMPLETED")),
      issue: count(eq(commandCenterTeam.status, "ISSUE")),
    })
    .from(commandCenterTeam)
    .where(eq(commandCenterTeam.workspaceId, workspaceId));

  const [incidentStats] = await db
    .select({
      total: count(),
      open: count(eq(commandCenterIncidents.status, "OPEN")),
      inProgress: count(eq(commandCenterIncidents.status, "IN_PROGRESS")),
      resolved: count(eq(commandCenterIncidents.status, "RESOLVED")),
    })
    .from(commandCenterIncidents)
    .where(eq(commandCenterIncidents.workspaceId, workspaceId));

  return {
    team: {
      total: teamStats?.total ?? 0,
      onTime: teamStats?.onTime ?? 0,
      delayed: teamStats?.delayed ?? 0,
      completed: teamStats?.completed ?? 0,
      issue: teamStats?.issue ?? 0,
    },
    incidents: {
      total: incidentStats?.total ?? 0,
      open: incidentStats?.open ?? 0,
      inProgress: incidentStats?.inProgress ?? 0,
      resolved: incidentStats?.resolved ?? 0,
    },
  };
  });
}
