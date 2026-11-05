import { eq, and } from "drizzle-orm";
import { workspaceMembers, users } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

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
