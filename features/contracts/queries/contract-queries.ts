import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { vendorContracts, vendors } from "@/db/schema";

export async function listWorkspaceContracts(workspaceId: string) {
  const db = await getDb();
  return db
    .select({
      id: vendorContracts.id,
      title: vendorContracts.title,
      fileUrl: vendorContracts.fileUrl,
      fileType: vendorContracts.fileType,
      fileSize: vendorContracts.fileSize,
      vendorId: vendorContracts.vendorId,
      vendorName: vendors.name,
      signedDate: vendorContracts.signedDate,
      notes: vendorContracts.notes,
      createdAt: vendorContracts.createdAt,
    })
    .from(vendorContracts)
    .innerJoin(vendors, eq(vendorContracts.vendorId, vendors.id))
    .where(eq(vendorContracts.workspaceId, workspaceId))
    .orderBy(desc(vendorContracts.createdAt));
}
