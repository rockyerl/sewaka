"use server";

import { eq, and } from "drizzle-orm";
import { vendorContracts, vendors } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { withWorkspace } from "@/lib/db/with-workspace";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/lib/utils/storage";
import { checkStorageLimit } from "@/lib/utils/subscription-check";

export async function uploadContractAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const vendorId = formData.get("vendorId") as string;
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;

  if (!workspaceId || !file || file.size === 0) throw new Error("File tidak valid");
  if (!vendorId) throw new Error("Vendor harus dipilih");

  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    throw new Error("Ukuran file maksimal 20MB.");
  }

  // Check subscription storage limit
  await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [vendor] = await tx.select({ id: vendors.id }).from(vendors).where(
        and(eq(vendors.id, vendorId), eq(vendors.workspaceId, workspaceId)),
      ).limit(1);
      if (!vendor) throw new Error("Vendor tidak ditemukan.");
    },
  );
  await checkStorageLimit(workspaceId, file.size);

  // Upload to Vercel Blob storage
  const uploadResult = await uploadFile(file, {
    pathname: `contracts/${workspaceId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`,
  });

  let contract;
  try {
    [contract] = await withWorkspace(
      { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
      (tx) => tx.insert(vendorContracts).values({
        workspaceId,
        vendorId,
        title: title || "Kontrak",
        fileUrl: uploadResult.url,
        fileType: file.type,
        fileSize: file.size,
        createdBy: session.user.id,
      }).returning(),
    );
  } catch (error) {
    await deleteFile(uploadResult.url).catch(() => undefined);
    throw error;
  }

  revalidatePath("/vendors");
  return { success: true, contract };
}

export async function deleteContractAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const contractId = formData.get("contractId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!contractId || !workspaceId) throw new Error("Data tidak valid");

  const [contract] = await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [row] = await tx.select().from(vendorContracts).where(
        and(eq(vendorContracts.id, contractId), eq(vendorContracts.workspaceId, workspaceId)),
      ).limit(1);
      if (row) await tx.delete(vendorContracts).where(
        and(eq(vendorContracts.id, contractId), eq(vendorContracts.workspaceId, workspaceId)),
      );
      return [row] as const;
    },
  );

  // Delete from cloud storage
  if (contract && contract.fileUrl) {
    await deleteFile(contract.fileUrl);
  }

  revalidatePath("/vendors");
  return { success: true };
}

export async function markContractSignedAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const contractId = formData.get("contractId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!contractId || !workspaceId) throw new Error("Data tidak valid");

  await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    (tx) => tx.update(vendorContracts).set({ signedDate: new Date() }).where(
      and(eq(vendorContracts.id, contractId), eq(vendorContracts.workspaceId, workspaceId)),
    ),
  );

  revalidatePath("/vendors");
  return { success: true };
}
