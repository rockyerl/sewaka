"use server";

import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { seatingTables, seatAssignments, guests } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const createTableSchema = z.object({
  workspaceId: z.string().uuid(),
  tableName: z.string().min(1),
  capacity: z.number().int().min(1).max(100),
  positionX: z.number().int().default(0),
  positionY: z.number().int().default(0),
  notes: z.string().optional(),
});

const updateTableSchema = z.object({
  tableId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  tableName: z.string().min(1).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  notes: z.string().optional(),
});

const assignSeatSchema = z.object({
  workspaceId: z.string().uuid(),
  tableId: z.string().uuid(),
  guestId: z.string().uuid(),
  seatNumber: z.number().int().optional(),
});

/**
 * Buat meja baru untuk seating planner.
 */
export async function createTableAction(data: {
  workspaceId: string;
  tableName: string;
  capacity: number;
  positionX?: number;
  positionY?: number;
  notes?: string;
}): Promise<{ success: boolean; tableId?: string; error?: string }> {
  const input = createTableSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const [newTable] = await tx
        .insert(seatingTables)
        .values({
          workspaceId: input.workspaceId,
          tableName: input.tableName,
          capacity: input.capacity,
          positionX: input.positionX ?? 0,
          positionY: input.positionY ?? 0,
          notes: input.notes ?? null,
        })
        .returning({ id: seatingTables.id });

      revalidatePath("/seating-planner");

      return {
        success: true,
        tableId: newTable?.id,
      };
    }
  );
}

/**
 * Update meja yang sudah ada.
 */
export async function updateTableAction(data: {
  tableId: string;
  workspaceId: string;
  tableName?: string;
  capacity?: number;
  positionX?: number;
  positionY?: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const input = updateTableSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const updates: Record<string, unknown> = {};
      if (input.tableName) updates.tableName = input.tableName;
      if (input.capacity) updates.capacity = input.capacity;
      if (input.positionX !== undefined) updates.positionX = input.positionX;
      if (input.positionY !== undefined) updates.positionY = input.positionY;
      if (input.notes !== undefined) updates.notes = input.notes;

      await tx
        .update(seatingTables)
        .set(updates)
        .where(
          and(
            eq(seatingTables.id, input.tableId),
            eq(seatingTables.workspaceId, input.workspaceId)
          )
        );

      revalidatePath("/seating-planner");

      return { success: true };
    }
  );
}

/**
 * Hapus meja dan semua seat assignments terkait.
 */
export async function deleteTableAction(
  tableId: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }> {
  return withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER"] },
    async (tx) => {
      // Delete seat assignments first (cascade should handle this, but explicit is safer)
      await tx
        .delete(seatAssignments)
        .where(
          and(
            eq(seatAssignments.tableId, tableId),
            eq(seatAssignments.workspaceId, workspaceId)
          )
        );

      await tx
        .delete(seatingTables)
        .where(
          and(
            eq(seatingTables.id, tableId),
            eq(seatingTables.workspaceId, workspaceId)
          )
        );

      revalidatePath("/seating-planner");

      return { success: true };
    }
  );
}

/**
 * Assign tamu ke meja.
 */
export async function assignSeatAction(data: {
  workspaceId: string;
  tableId: string;
  guestId: string;
  seatNumber?: number;
}): Promise<{ success: boolean; error?: string }> {
  const input = assignSeatSchema.parse(data);

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      // Check if table exists and get capacity
      const [table] = await tx
        .select({ capacity: seatingTables.capacity })
        .from(seatingTables)
        .where(
          and(
            eq(seatingTables.id, input.tableId),
            eq(seatingTables.workspaceId, input.workspaceId)
          )
        );

      if (!table) {
        return { success: false, error: "Meja tidak ditemukan." };
      }

      // Check current assignments count
      const [currentCount] = await tx
        .select({ count: count() })
        .from(seatAssignments)
        .where(eq(seatAssignments.tableId, input.tableId));

      if ((currentCount?.count ?? 0) >= table.capacity) {
        return { success: false, error: "Meja sudah penuh." };
      }

      // Remove existing assignment for this guest (if any)
      await tx
        .delete(seatAssignments)
        .where(
          and(
            eq(seatAssignments.guestId, input.guestId),
            eq(seatAssignments.workspaceId, input.workspaceId)
          )
        );

      // Create new assignment
      await tx.insert(seatAssignments).values({
        workspaceId: input.workspaceId,
        tableId: input.tableId,
        guestId: input.guestId,
        seatNumber: input.seatNumber ?? null,
      });

      revalidatePath("/seating-planner");

      return { success: true };
    }
  );
}

/**
 * Hapus seat assignment.
 */
export async function removeSeatAction(
  guestId: string,
  tableId: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }> {
  return withWorkspace(
    { workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .delete(seatAssignments)
        .where(
          and(
            eq(seatAssignments.guestId, guestId),
            eq(seatAssignments.tableId, tableId),
            eq(seatAssignments.workspaceId, workspaceId)
          )
        );

      revalidatePath("/seating-planner");

      return { success: true };
    }
  );
}

/**
 * Get semua meja dengan seat assignments untuk workspace.
 */
export async function getSeatingPlanAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, async (db) => {

  // Get all tables
  const tables = await db
    .select()
    .from(seatingTables)
    .where(eq(seatingTables.workspaceId, workspaceId))
    .orderBy(seatingTables.positionY, seatingTables.positionX);

  // Get all seat assignments
  const assignments = await db
    .select({
      tableId: seatAssignments.tableId,
      guestId: seatAssignments.guestId,
      guestName: guests.name,
      seatNumber: seatAssignments.seatNumber,
    })
    .from(seatAssignments)
    .leftJoin(guests, eq(seatAssignments.guestId, guests.id))
    .where(eq(seatAssignments.workspaceId, workspaceId));

  // Group assignments by table
  const assignmentsByTable = new Map<string, typeof assignments>();
  for (const assignment of assignments) {
    const tableId = assignment.tableId;
    if (!assignmentsByTable.has(tableId)) {
      assignmentsByTable.set(tableId, []);
    }
    assignmentsByTable.get(tableId)!.push(assignment);
  }

  // Build result
  const result = tables.map((table) => ({
    ...table,
    assignments: assignmentsByTable.get(table.id) ?? [],
    assignedCount: (assignmentsByTable.get(table.id) ?? []).length,
  }));

  return result;
  });
}

/**
 * Get tamu yang belum di-assign ke meja.
 */
export async function getUnassignedGuestsAction(workspaceId: string) {
  return withWorkspace({ workspaceId }, async (db) => {

  // Get all guests
  const allGuests = await db
    .select({
      id: guests.id,
      name: guests.name,
      category: guests.category,
      side: guests.side,
      isVip: guests.isVip,
    })
    .from(guests)
    .where(eq(guests.workspaceId, workspaceId))
    .orderBy(guests.name);

  // Get assigned guest IDs
  const assignments = await db
    .select({ guestId: seatAssignments.guestId })
    .from(seatAssignments)
    .where(eq(seatAssignments.workspaceId, workspaceId));

  const assignedGuestIds = new Set(assignments.map((a) => a.guestId));

  // Filter out assigned guests
  const unassigned = allGuests.filter((guest) => !assignedGuestIds.has(guest.id));

  return unassigned;
  });
}
