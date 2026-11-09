"use server";

import { eq, and, count, sql } from "drizzle-orm";
import { guests, expenses, budgetCategories, weddingWorkspaces, curatedVendors } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";

const viewerRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

export interface RsvpStats {
  total: number;
  coming: number;
  notComing: number;
  pending: number;
}

export interface BudgetCategoryData {
  name: string;
  budget: number;
  spent: number;
}

export interface AttendanceData {
  date: string;
  checkedIn: number;
}

export interface VendorData {
  name: string;
  category: string;
  priceRange: string;
  rating: number;
  isBooked: boolean;
}

/**
 * Get RSVP statistics untuk pie chart.
 */
export async function getRsvpStatsAction(workspaceId: string): Promise<RsvpStats> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async (tx) => {
      const [stats] = await tx
        .select({
          total: count(),
          coming: count(sql`CASE WHEN ${guests.rsvpStatus} = 'ACCEPTED' THEN 1 END`),
          notComing: count(sql`CASE WHEN ${guests.rsvpStatus} = 'DECLINED' THEN 1 END`),
          pending: count(sql`CASE WHEN ${guests.rsvpStatus} = 'PENDING' THEN 1 END`),
        })
        .from(guests)
        .where(eq(guests.workspaceId, workspaceId));

      return {
        total: stats?.total ?? 0,
        coming: stats?.coming ?? 0,
        notComing: stats?.notComing ?? 0,
        pending: stats?.pending ?? 0,
      };
    }
  ).catch((error) => {
    console.error(`Failed query: ${error.message}`);
    throw error;
  });
}

/**
 * Get budget per category untuk bar chart.
 */
export async function getBudgetByCategoryAction(workspaceId: string): Promise<BudgetCategoryData[]> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async (tx) => {
      // Get all categories with their budget
      const categories = await tx
        .select({
          id: budgetCategories.id,
          name: budgetCategories.name,
          budget: budgetCategories.allocatedAmount,
        })
        .from(budgetCategories)
        .where(eq(budgetCategories.workspaceId, workspaceId));

      // Get total spent per category
      const expenseRows = await tx
        .select({
          categoryId: expenses.categoryId,
          total: sql<number>`SUM(${expenses.amount})`,
        })
        .from(expenses)
        .where(eq(expenses.workspaceId, workspaceId))
        .groupBy(expenses.categoryId);

      const expenseMap: Record<string, number> = {};
      for (const exp of expenseRows) {
        expenseMap[exp.categoryId!] = Number(exp.total) || 0;
      }

      return categories.map((cat) => ({
        name: cat.name,
        budget: Number(cat.budget) || 0,
        spent: expenseMap[cat.id] || 0,
      }));
    }
  ).catch((error) => {
    console.error(`Failed query: ${error.message}`);
    throw error;
  });
}

/**
 * Get attendance data per day untuk line chart.
 */
export async function getAttendanceTrendsAction(workspaceId: string): Promise<AttendanceData[]> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async (tx) => {
      // Get workspace wedding date
      const [workspace] = await tx
        .select({ weddingDate: weddingWorkspaces.weddingDate })
        .from(weddingWorkspaces)
        .where(eq(weddingWorkspaces.id, workspaceId));

      if (!workspace?.weddingDate) {
        return [];
      }

      // Get check-in count per day (last 7 days)
      const startDate = new Date(workspace.weddingDate);
      startDate.setDate(startDate.getDate() - 7);

      const logs = await tx
        .select({
          date: sql<string>`DATE(${guests.checkedInAt})`,
          checkedIn: count(),
        })
        .from(guests)
        .where(
          and(
            eq(guests.workspaceId, workspaceId),
            eq(guests.checkedIn, true),
            sql`${guests.checkedInAt} >= ${startDate}`
          )
        )
        .groupBy(sql`DATE(${guests.checkedInAt})`);

      // Fill in missing days
      const result: AttendanceData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(workspace.weddingDate);
        date.setDate(date.getDate() - i);
        if (date > today) continue;

        const dateStr = date.toISOString().split("T")[0];
        const found = logs.find((log) => {
          const logDate = new Date(log.date as unknown as string);
          return logDate.toISOString().split("T")[0] === dateStr;
        });

        result.push({
          date: dateStr,
          checkedIn: found ? Number(found.checkedIn) : 0,
        });
      }

      return result;
    }
  ).catch((error) => {
    console.error(`Failed query: ${error.message}`);
    throw error;
  });
}

/**
 * Get vendor comparison data.
 */
export async function getVendorComparisonAction(workspaceId: string): Promise<VendorData[]> {
  return withWorkspace(
    { workspaceId, allowedRoles: viewerRoles },
    async (tx) => {
      // Get curated vendors (public data)
      const vendors = await tx
        .select({
          name: curatedVendors.name,
          category: curatedVendors.category,
          priceRange: curatedVendors.priceRange,
          rating: curatedVendors.rating,
          isVerified: curatedVendors.isVerified,
        })
        .from(curatedVendors)
        .limit(10);

      return vendors.map((v) => ({
        name: v.name,
        category: v.category,
        priceRange: v.priceRange,
        rating: Number(v.rating) || 0,
        isBooked: false, // Will be updated when vendor is booked
      }));
    }
  ).catch((error) => {
    console.error(`Failed query: ${error.message}`);
    throw error;
  });
}
