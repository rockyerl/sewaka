/**
 * Subscription enforcement utility
 *
 * Checks subscription status, numeric limits (guests, vendors, storage),
 * and feature access for a given workspace. This is the single source of
 * truth for what a workspace can and cannot do based on their plan.
 */

import { eq, and, count, sql } from "drizzle-orm";
import { withWorkspace } from "@/lib/db/with-workspace";
import {
  subscriptions,
  subscriptionPlans,
  guests,
  vendors,
  imageGallery,
  documents,
  vendorContracts,
  expenseAttachments,
  taskAttachments,
} from "@/lib/db/schema";

/**
 * Result of a subscription check — contains plan info and all limits.
 */
export interface SubscriptionInfo {
  /** Current plan name (e.g., "Gratis", "Premium", "Enterprise") */
  planName: string;
  /** Whether the subscription is active */
  isActive: boolean;
  /** Max guests allowed (null = unlimited) */
  maxGuests: number | null;
  /** Max vendors allowed (null = unlimited) */
  maxVendors: number | null;
  /** Max storage in bytes (null = unlimited) */
  maxStorageBytes: number | null;
  /** Feature flags defined by the plan */
  features: string[];
}

/**
 * Error thrown when a subscription limit is exceeded.
 */
export class SubscriptionLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionLimitError";
  }
}

/**
 * Get the current subscription info for a workspace.
 * Defaults to "Gratis" plan if no active subscription.
 */
export async function getSubscriptionInfo(workspaceId: string): Promise<SubscriptionInfo> {
  const [sub] = await withWorkspace({ workspaceId }, async (tx) =>
    tx
      .select({
        status: subscriptions.status,
        planName: subscriptionPlans.name,
        maxGuests: subscriptionPlans.maxGuests,
        maxVendors: subscriptionPlans.maxVendors,
        maxStorageBytes: subscriptionPlans.maxStorageBytes,
        features: subscriptionPlans.features,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(eq(subscriptions.workspaceId, workspaceId), eq(subscriptions.status, "ACTIVE")))
      .limit(1),
  );

  if (!sub || !sub.planName) {
    // Default "Gratis" plan limits
    return {
      planName: "Gratis",
      isActive: false,
      maxGuests: 50,
      maxVendors: 10,
      maxStorageBytes: 1073741824, // 1 GB
      features: [
        "basic_tasks",
        "basic_budget",
        "basic_guests",
        "1 workspace pernikahan",
        "Hingga 50 tamu",
        "Hingga 10 vendor",
        "Checklist persiapan",
        "Manajemen anggaran dasar",
      ],
    };
  }

  return {
    planName: sub.planName,
    isActive: true,
    maxGuests: sub.maxGuests,
    maxVendors: sub.maxVendors,
    maxStorageBytes: sub.maxStorageBytes,
    features: (sub.features as string[] | null) ?? [],
  };
}

/**
 * Check if a workspace can add more guests.
 * Throws SubscriptionLimitError if limit exceeded.
 */
export async function checkGuestLimit(workspaceId: string): Promise<void> {
  const info = await getSubscriptionInfo(workspaceId);

  if (info.maxGuests === null) return; // Unlimited

  const [{ count: currentCount }] = await withWorkspace({ workspaceId }, async (tx) =>
    tx.select({ count: count() }).from(guests).where(eq(guests.workspaceId, workspaceId)),
  );

  const numCount = Number(currentCount);
  if (numCount >= info.maxGuests) {
    throw new SubscriptionLimitError(
      `Paket ${info.planName} membatasi ${info.maxGuests} tamu. Upgrade ke Premium untuk hingga 500 tamu.`,
    );
  }
}

/**
 * Check if a workspace can add more vendors.
 * Throws SubscriptionLimitError if limit exceeded.
 */
export async function checkVendorLimit(workspaceId: string): Promise<void> {
  const info = await getSubscriptionInfo(workspaceId);

  if (info.maxVendors === null) return; // Unlimited

  const [{ count: currentCount }] = await withWorkspace({ workspaceId }, async (tx) =>
    tx.select({ count: count() }).from(vendors).where(eq(vendors.workspaceId, workspaceId)),
  );

  const numCount = Number(currentCount);
  if (numCount >= info.maxVendors) {
    throw new SubscriptionLimitError(
      `Paket ${info.planName} membatasi ${info.maxVendors} vendor. Upgrade ke Premium untuk vendor unlimited.`,
    );
  }
}

/**
 * Check if a workspace has storage quota remaining.
 * `fileSize` is the size of the file being uploaded in bytes.
 * Throws SubscriptionLimitError if quota exceeded.
 */
export async function checkStorageLimit(workspaceId: string, fileSize: number): Promise<void> {
  const info = await getSubscriptionInfo(workspaceId);

  if (info.maxStorageBytes === null) return; // Unlimited

  // Sum file sizes while the workspace RLS context is active.
  const [gallerySize, docSize, contractSize, expenseAttachmentSize, taskAttachmentSize] = await withWorkspace({ workspaceId }, async (tx) =>
    Promise.all([
      tx
        .select({ total: sql<number>`COALESCE(SUM(${imageGallery.fileSize}), 0)` })
        .from(imageGallery)
        .where(eq(imageGallery.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${documents.fileSize}), 0)` })
        .from(documents)
        .where(eq(documents.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${vendorContracts.fileSize}), 0)` })
        .from(vendorContracts)
        .where(eq(vendorContracts.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${expenseAttachments.fileSize}), 0)` })
        .from(expenseAttachments)
        .where(eq(expenseAttachments.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${taskAttachments.fileSize}), 0)` })
        .from(taskAttachments)
        .where(eq(taskAttachments.workspaceId, workspaceId)),
    ]),
  );

  const usedBytes = [gallerySize, docSize, contractSize, expenseAttachmentSize, taskAttachmentSize]
    .reduce((total, rows) => total + Number(rows[0]?.total ?? 0), 0);
  const remaining = info.maxStorageBytes - usedBytes;

  if (fileSize > remaining) {
    const usedGB = (usedBytes / 1024 / 1024 / 1024).toFixed(1);
    const maxGB = (info.maxStorageBytes / 1024 / 1024 / 1024).toFixed(1);
    throw new SubscriptionLimitError(
      `Storage terpakai ${usedGB} GB dari ${maxGB} GB. Upgrade paket untuk storage lebih besar.`,
    );
  }
}

/**
 * Check if a workspace has access to a premium feature.
 * Returns true if the feature is available on the current plan.
 */
export async function checkFeatureAccess(
  workspaceId: string,
  feature: string,
): Promise<boolean> {
  const info = await getSubscriptionInfo(workspaceId);

  // Check if the feature is in the plan's feature list
  if (info.features.includes(feature)) return true;

  // Legacy feature name mapping
  const freeFeatures = ["basic_tasks", "basic_budget", "basic_guests"];
  if (freeFeatures.includes(feature)) return true;

  const premiumFeatures = [
    "digital_invitation",
    "qr_checkin",
    "family_collaboration",
    "financial_reports",
    "unlimited_vendors",
    "unlimited_guests",
    "priority_support",
    "guest_import_export",
    "vendor_comparison",
  ];
  if (info.isActive && premiumFeatures.includes(feature)) return true;

  const enterpriseFeatures = [
    "multi_workspace",
    "white_label",
    "api_access",
    "dedicated_support",
  ];
  if (info.isActive && info.planName === "Enterprise" && enterpriseFeatures.includes(feature))
    return true;

  return false;
}

/**
 * Enforce a premium feature requirement.
 * Throws SubscriptionLimitError if the feature is not available.
 */
export async function requireFeature(
  workspaceId: string,
  feature: string,
  errorMessage?: string,
): Promise<void> {
  const hasAccess = await checkFeatureAccess(workspaceId, feature);
  if (!hasAccess) {
    const info = await getSubscriptionInfo(workspaceId);
    throw new SubscriptionLimitError(
      errorMessage ??
        `Fitur ini hanya tersedia di paket Premium atau lebih tinggi. Paket saat ini: ${info.planName}.`,
    );
  }
}

/**
 * Get a human-readable summary of current usage vs limits.
 * Useful for displaying quota info in UI.
 */
export async function getUsageSummary(workspaceId: string) {
  const info = await getSubscriptionInfo(workspaceId);
  const [
    guestRow,
    vendorRow,
    galleryRow,
    docRow,
    contractRow,
    expenseAttachmentRow,
    taskAttachmentRow,
  ] = await withWorkspace({ workspaceId }, async (tx) =>
    Promise.all([
      tx.select({ count: count() }).from(guests).where(eq(guests.workspaceId, workspaceId)),
      tx.select({ count: count() }).from(vendors).where(eq(vendors.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${imageGallery.fileSize}), 0)` })
        .from(imageGallery)
        .where(eq(imageGallery.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${documents.fileSize}), 0)` })
        .from(documents)
        .where(eq(documents.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${vendorContracts.fileSize}), 0)` })
        .from(vendorContracts)
        .where(eq(vendorContracts.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${expenseAttachments.fileSize}), 0)` })
        .from(expenseAttachments)
        .where(eq(expenseAttachments.workspaceId, workspaceId)),
      tx
        .select({ total: sql<number>`COALESCE(SUM(${taskAttachments.fileSize}), 0)` })
        .from(taskAttachments)
        .where(eq(taskAttachments.workspaceId, workspaceId)),
    ]),
  );

  const usedBytes = [galleryRow, docRow, contractRow, expenseAttachmentRow, taskAttachmentRow]
    .reduce((total, rows) => total + Number(rows[0]?.total ?? 0), 0);

  return {
    plan: info.planName,
    guests: {
      used: Number(guestRow[0]?.count ?? 0),
      limit: info.maxGuests,
      percentage: info.maxGuests ? (Number(guestRow[0]?.count ?? 0) / info.maxGuests) * 100 : 0,
    },
    vendors: {
      used: Number(vendorRow[0]?.count ?? 0),
      limit: info.maxVendors,
      percentage: info.maxVendors ? (Number(vendorRow[0]?.count ?? 0) / info.maxVendors) * 100 : 0,
    },
    storage: {
      used: usedBytes,
      limit: info.maxStorageBytes,
      percentage: info.maxStorageBytes ? (usedBytes / info.maxStorageBytes) * 100 : 0,
    },
  };
}
