import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { vendorPortfolioImages, vendors } from "@/lib/db/schema";
import { uploadFile, deleteFile } from "@/lib/utils/storage";
import { checkStorageLimit, SubscriptionLimitError } from "@/lib/utils/subscription-check";

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

  await getDb().insert(vendorPortfolioImages).values({
    vendorId: input.vendorId,
    workspaceId: input.workspaceId,
    imageUrl: input.imageUrl,
    caption: input.caption,
    sortOrder: input.sortOrder ?? 0,
  });

  revalidatePath("/vendors");
}

export async function getVendorPortfolioAction(vendorId: string, workspaceId: string) {
  const result = await getDb()
    .select()
    .from(vendorPortfolioImages)
    .where(
      and(
        eq(vendorPortfolioImages.vendorId, vendorId),
        eq(vendorPortfolioImages.workspaceId, workspaceId),
      ),
    )
    .orderBy(asc(vendorPortfolioImages.sortOrder));

  return result;
}

export async function deleteVendorPortfolioImageAction(imageId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  const [image] = await getDb()
    .select()
    .from(vendorPortfolioImages)
    .where(eq(vendorPortfolioImages.id, imageId))
    .limit(1);

  // Delete from cloud storage
  if (image && image.imageUrl) {
    await deleteFile(image.imageUrl);
  }

  await getDb().delete(vendorPortfolioImages).where(eq(vendorPortfolioImages.id, imageId));
  revalidatePath("/vendors");
}

export async function getVendorDetailAction(vendorId: string, workspaceId: string) {
  const [vendor] = await getDb()
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.id, vendorId),
        eq(vendors.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  return vendor ?? null;
}
