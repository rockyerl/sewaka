import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { vendors } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";

export const vendorSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  contactName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  status: z.enum(["SHORTLISTED", "CONTACTED", "BOOKED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Vendor = z.infer<typeof vendorSchema>;

export async function listWorkspaceVendors(workspaceId: string, userId?: string): Promise<Vendor[]> {
  return withWorkspace(
    { workspaceId, userId },
    async (tx) => {
      const rows = await tx
        .select()
        .from(vendors)
        .where(eq(vendors.workspaceId, workspaceId))
        .orderBy(desc(vendors.createdAt));

      return z.array(vendorSchema).parse(rows);
    },
  );
}
