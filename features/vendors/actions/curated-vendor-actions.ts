"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { curatedVendors, vendors } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";
import { bookmarkCuratedVendorSchema } from "../schemas/curated-vendor";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export async function bookmarkCuratedVendorAction(formData: FormData) {
  const input = bookmarkCuratedVendorSchema.parse({
    workspaceId: formData.get("workspaceId"),
    curatedVendorId: formData.get("curatedVendorId"),
    category: formData.get("category") || undefined,
  });

  const db = getDb();
  const [curated] = await db
    .select()
    .from(curatedVendors)
    .where(eq(curatedVendors.id, input.curatedVendorId))
    .limit(1);

  if (!curated) {
    throw new Error("Vendor kurasi tidak ditemukan.");
  }

  const categoryName = input.category || curated.category;
  const notes = `${curated.tagline}\nKisaran Biaya: ${curated.priceRange}\nWilayah: ${curated.locationCity}\nInstagram: ${curated.instagramHandle || "-"}`;

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      await tx.insert(vendors).values({
        workspaceId: input.workspaceId,
        name: curated.name,
        category: categoryName,
        contactName: curated.name,
        phone: curated.whatsappNumber,
        notes,
        status: "SHORTLISTED",
      });
    }
  );

  revalidatePath("/vendors");
  return { success: true };
}
