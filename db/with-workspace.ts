import "server-only";

import { auth } from "@/auth";
import { and, eq, sql, type ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgTransaction } from "drizzle-orm/node-postgres";
import { z } from "zod";

import { getDb } from "./index";
import { drizzleSchema, workspaceMembers } from "./schema";

export type WorkspaceTransaction = NodePgTransaction<
  typeof drizzleSchema,
  ExtractTablesWithRelations<typeof drizzleSchema>
>;
export type WorkspaceRole = (typeof workspaceMembers.$inferSelect)["role"];

const identifierSchema = z.string().uuid();

export class WorkspaceAccessError extends Error {
  constructor() {
    super("Workspace access denied");
    this.name = "WorkspaceAccessError";
  }
}

/**
 * Overload: operasi yang butuh workspaceId otomatis dari user (callback form).
 */
export async function withWorkspace<T>(
  operation: (transaction: WorkspaceTransaction, workspaceId: string) => Promise<T>,
): Promise<T>;

/**
 * Overload: operasi dengan workspaceId eksplisit (object form).
 * userId opsional untuk menghindari multiple auth() calls.
 */
export async function withWorkspace<T>(
  options: {
    workspaceId: string;
    userId?: string;
    allowedRoles?: readonly WorkspaceRole[];
  },
  operation: (transaction: WorkspaceTransaction) => Promise<T>,
): Promise<T>;

export async function withWorkspace<T>(
  first:
    | { workspaceId?: string; allowedRoles?: readonly WorkspaceRole[]; userId?: string }
    | ((transaction: WorkspaceTransaction, workspaceId: string) => Promise<T>),
  second?: (transaction: WorkspaceTransaction) => Promise<T>,
): Promise<T> {
  // Callback form: withWorkspace(async (tx, wid) => ...)
  if (typeof first === "function") {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || !identifierSchema.safeParse(userId).success) {
      throw new WorkspaceAccessError();
    }

    return getDb().transaction(async (transaction) => {
      // Must set app.user_id first so workspace_members RLS policy allows read
      await transaction.execute(sql`
        select set_config('app.user_id', ${userId}, true)
      `);

      const [membership] = await transaction
        .select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, userId))
        .limit(1);

      if (!membership) {
        throw new WorkspaceAccessError();
      }

      await transaction.execute(sql`
        select set_config('app.workspace_id', ${membership.workspaceId}, true)
      `);

      return first(transaction, membership.workspaceId);
    });
  }

  // Object form
  const { userId: explicitUserId, workspaceId: explicitWorkspaceId, allowedRoles } = first;

  // Determine userId: use explicit or fetch from auth
  let userId: string;
  if (explicitUserId) {
    userId = identifierSchema.parse(explicitUserId);
  } else {
    const session = await auth();
    const sessionId = session?.user?.id;
    if (!sessionId || !identifierSchema.safeParse(sessionId).success) {
      throw new WorkspaceAccessError();
    }
    userId = sessionId;
  }

  return getDb().transaction(async (transaction) => {
    // Must set app.user_id first so workspace_members RLS policy allows read
    await transaction.execute(sql`
      select set_config('app.user_id', ${userId}, true)
    `);

    // If no explicit workspaceId, auto-detect
    let workspaceId: string;
    if (!explicitWorkspaceId) {
      const [membership] = await transaction
        .select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, userId))
        .limit(1);

      if (!membership) {
        throw new WorkspaceAccessError();
      }

      workspaceId = membership.workspaceId;
    } else {
      workspaceId = identifierSchema.parse(explicitWorkspaceId);
    }

    // Verify user has access to the workspace
    const [membership] = await transaction
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new WorkspaceAccessError();
    }

    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      throw new WorkspaceAccessError();
    }

    await transaction.execute(sql`
      select set_config('app.workspace_id', ${workspaceId}, true)
    `);

    if (!second) {
      throw new WorkspaceAccessError();
    }
    return second(transaction);
  });
}
