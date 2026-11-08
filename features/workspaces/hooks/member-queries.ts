import { eq, and } from "drizzle-orm";
import { workspaceMembers, users } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { getDb } from "@/lib/db";

/**
 * Find a user by email address
 */
export async function findUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return user || null;
}

/**
 * Add a new member to a workspace by email.
 * The user must already exist in the system.
 * Only OWNER or COORDINATOR can add members.
 */
export async function addMember(workspaceId: string, email: string, role: "PARTNER" | "FAMILY" | "COORDINATOR") {
  const invitee = await findUserByEmail(email);
  if (!invitee) {
    throw new Error(`User dengan email "${email}" tidak ditemukan. Mereka harus mendaftar di Sewaka terlebih dahulu.`);
  }

  return withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "COORDINATOR"] },
    async (tx) => {
      // Check if already a member
      const [existing] = await tx
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, invitee.id),
          ),
        )
        .limit(1);

      if (existing) {
        throw new Error(`${invitee.name || email} sudah menjadi anggota workspace ini.`);
      }

      const [member] = await tx
        .insert(workspaceMembers)
        .values({
          workspaceId,
          userId: invitee.id,
          role,
        })
        .returning();

      return member;
    },
  );
}

export async function listWorkspaceMembers() {
  return withWorkspace(async (tx, workspaceId) => {
    return tx
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .orderBy(workspaceMembers.role);
  });
}

export async function updateMemberRole(memberId: string, role: "PARTNER" | "FAMILY" | "COORDINATOR") {
  return withWorkspace(async (tx, workspaceId) => {
    const [updated] = await tx
      .update(workspaceMembers)
      .set({ role })
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .returning();
    return updated;
  });
}

export async function removeMember(memberId: string) {
  return withWorkspace(async (tx, workspaceId) => {
    await tx
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );
  });
}
