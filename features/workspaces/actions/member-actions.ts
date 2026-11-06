"use server";

import { revalidatePath } from "next/cache";
import { addMember, updateMemberRole, removeMember } from "../queries/member-queries";
import { inviteMemberSchema, updateMemberRoleSchema } from "../schemas/member";
import { requireFeature, SubscriptionLimitError } from "@/lib/subscription-check";

/**
 * Invite a new member to the workspace by email (COL-02)
 * User must already be registered in Sewaka.
 * Family collaboration is a premium feature.
 */
export async function inviteMemberAction(formData: FormData) {
  const workspaceId = formData.get("workspaceId") as string;
  const input = inviteMemberSchema.parse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  // Family collaboration is a premium feature
  try {
    await requireFeature(workspaceId, "family_collaboration");
  } catch (err) {
    if (err instanceof SubscriptionLimitError) {
      throw err;
    }
  }

  await addMember(workspaceId, input.email, input.role);
  revalidatePath("/workspaces");
}

export async function updateMemberRoleAction(formData: FormData) {
  const input = updateMemberRoleSchema.parse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  await updateMemberRole(input.memberId, input.role);
  revalidatePath("/workspaces");
}

export async function removeMemberAction(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  await removeMember(memberId);
  revalidatePath("/workspaces");
}
