import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

import { vendorPortfolioImages, vendors } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { deleteFile } from "@/lib/utils/storage";

export const addVendorPortfolioImageSchema = z.object({
  vendorId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  imageUrl: z.string().url(),
  caption: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function addVendorPortfolioImageAction(
  data: z.input<typeof addVendorPortfolioImageSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const input = addVendorPortfolioImageSchema.parse(data);

  await withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [vendor] = await tx.select({ id: vendors.id }).from(vendors).where(
        and(eq(vendors.id, input.vendorId), eq(vendors.workspaceId, input.workspaceId)),
      ).limit(1);
      if (!vendor) throw new Error("Vendor tidak ditemukan.");
      await tx.insert(vendorPortfolioImages).values({
        vendorId: input.vendorId,
        workspaceId: input.workspaceId,
        imageUrl: input.imageUrl,
        caption: input.caption,
        sortOrder: input.sortOrder ?? 0,
      });
    },
  );

  revalidatePath("/vendors");
}

export async function getVendorPortfolioAction(vendorId: string, workspaceId: string) {
  return withWorkspace({ workspaceId }, (tx) =>
    tx.select().from(vendorPortfolioImages).where(
      and(eq(vendorPortfolioImages.vendorId, vendorId), eq(vendorPortfolioImages.workspaceId, workspaceId)),
    ).orderBy(asc(vendorPortfolioImages.sortOrder)),
  );
}

export async function deleteVendorPortfolioImageAction(imageId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const [image] = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [row] = await tx.select().from(vendorPortfolioImages).where(
        and(eq(vendorPortfolioImages.id, imageId), eq(vendorPortfolioImages.workspaceId, workspaceId)),
      ).limit(1);
      if (row) await tx.delete(vendorPortfolioImages).where(
        and(eq(vendorPortfolioImages.id, imageId), eq(vendorPortfolioImages.workspaceId, workspaceId)),
      );
      return [row] as const;
    },
  );

  // Delete from cloud storage
  if (image && image.imageUrl) {
    await deleteFile(image.imageUrl);
  }

  revalidatePath("/vendors");
}

export async function getVendorDetailAction(vendorId: string, workspaceId: string) {
  const [vendor] = await withWorkspace({ workspaceId }, (tx) => tx
    .select()
    .from(vendors)
    .where(and(eq(vendors.id, vendorId), eq(vendors.workspaceId, workspaceId)))
    .limit(1));

  return vendor ?? null;
}
