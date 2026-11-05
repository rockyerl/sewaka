"use server";

import { revalidatePath } from "next/cache";
import { updateMemberRole, removeMember } from "../queries/member-queries";
import { updateMemberRoleSchema } from "../schemas/member";

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
