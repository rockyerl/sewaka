"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { vendors } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { checkVendorLimit } from "@/lib/utils/subscription-check";

import { createVendorSchema, deleteVendorSchema, updateVendorStatusSchema } from "../actions/vendor-schema";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function createVendorAction(formData: FormData) {
  const input = createVendorSchema.parse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    category: formData.get("category"),
    contactName: String(formData.get("contactName") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
  });

  // Check subscription vendor limit
  await checkVendorLimit(input.workspaceId);

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx.insert(vendors).values({
        workspaceId: input.workspaceId,
        name: input.name,
        category: input.category,
        contactName: input.contactName || null,
        phone: input.phone || null,
        email: input.email || null,
        notes: input.notes || null,
      });
    },
  );

  revalidatePath("/");
}

export async function updateVendorStatusAction(formData: FormData) {
  const input = updateVendorStatusSchema.parse({
    workspaceId: formData.get("workspaceId"),
    vendorId: formData.get("vendorId"),
    status: formData.get("status"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .update(vendors)
        .set({ status: input.status })
        .where(
          and(
            eq(vendors.id, input.vendorId),
            eq(vendors.workspaceId, input.workspaceId),
          ),
        );
    },
  );

  revalidatePath("/");
}

export async function deleteVendorAction(formData: FormData) {
  const input = deleteVendorSchema.parse({
    workspaceId: formData.get("workspaceId"),
    vendorId: formData.get("vendorId"),
  });

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx
        .delete(vendors)
        .where(
          and(
            eq(vendors.id, input.vendorId),
            eq(vendors.workspaceId, input.workspaceId),
          ),
        );
    },
  );

  revalidatePath("/");
}
