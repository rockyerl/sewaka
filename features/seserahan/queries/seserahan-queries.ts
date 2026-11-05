import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { culturalSeserahanItems } from "@/db/schema";
import { withWorkspace } from "@/db/with-workspace";
import {
  seserahanItemSchema,
  type SeserahanItem,
} from "../schemas/seserahan";

export async function listWorkspaceSeserahan(
  workspaceId: string,
  userId?: string
): Promise<SeserahanItem[]> {
  return withWorkspace({ workspaceId, userId }, async (tx) => {
    const rows = await tx
      .select()
      .from(culturalSeserahanItems)
      .where(eq(culturalSeserahanItems.workspaceId, workspaceId))
      .orderBy(asc(culturalSeserahanItems.boxNumber), asc(culturalSeserahanItems.createdAt));

    return z.array(seserahanItemSchema).parse(rows);
  });
}
