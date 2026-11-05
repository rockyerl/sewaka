"use server";

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { vendorContracts } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/lib/storage";

export async function uploadContractAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const vendorId = formData.get("vendorId") as string;
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) throw new Error("File tidak valid");
  if (!vendorId) throw new Error("Vendor harus dipilih");

  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    throw new Error("Ukuran file maksimal 20MB.");
  }

  // Upload to Vercel Blob storage
  const uploadResult = await uploadFile(file, {
    pathname: `contracts/${workspaceId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`,
    accessType: "public",
  });

  const db = await getDb();
  const [contract] = await db
    .insert(vendorContracts)
    .values({
      workspaceId,
      vendorId,
      title: title || "Kontrak",
      fileUrl: uploadResult.url,
      fileType: file.type,
      fileSize: file.size,
      createdBy: session.user.id,
    })
    .returning();

  revalidatePath("/vendors");
  return { success: true, contract };
}

export async function deleteContractAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const contractId = formData.get("contractId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!contractId || !workspaceId) throw new Error("Data tidak valid");

  const db = await getDb();
  const [contract] = await db
    .select()
    .from(vendorContracts)
    .where(
      and(
        eq(vendorContracts.id, contractId),
        eq(vendorContracts.workspaceId, workspaceId)
      )
    );

  // Delete from cloud storage
  if (contract && contract.fileUrl) {
    await deleteFile(contract.fileUrl);
  }

  await db.delete(vendorContracts).where(
    and(
      eq(vendorContracts.id, contractId),
      eq(vendorContracts.workspaceId, workspaceId)
    )
  );

  revalidatePath("/vendors");
  return { success: true };
}

export async function markContractSignedAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const contractId = formData.get("contractId") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!contractId || !workspaceId) throw new Error("Data tidak valid");

  const db = await getDb();
  await db
    .update(vendorContracts)
    .set({ signedDate: new Date() })
    .where(
      and(
        eq(vendorContracts.id, contractId),
        eq(vendorContracts.workspaceId, workspaceId)
      )
    );

  revalidatePath("/vendors");
  return { success: true };
}
