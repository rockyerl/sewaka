import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { curatedVendors } from "@/lib/db/schema";
import {
  curatedVendorSchema,
  type CuratedVendor,
} from "../actions/curated-vendor-schema";

export interface ListCuratedVendorsFilters {
  tradition?: string;
  category?: string;
}

export async function listCuratedVendors(
  filters?: ListCuratedVendorsFilters
): Promise<CuratedVendor[]> {
  const db = getDb();

  const conditions = [];
  if (filters?.tradition && filters.tradition !== "ALL") {
    conditions.push(eq(curatedVendors.tradition, filters.tradition));
  }
  if (filters?.category && filters.category !== "ALL") {
    conditions.push(eq(curatedVendors.category, filters.category));
  }

  const rows = await db
    .select()
    .from(curatedVendors)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(curatedVendors.rating));

  return z.array(curatedVendorSchema).parse(rows);
}
