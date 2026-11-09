"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { vendorInquiries, vendorReviews } from "@/lib/db/schema";
import { withWorkspace } from "@/lib/db/with-workspace";
import { rateLimit } from "@/lib/utils/rate-limit";

const editorRoles = ["OWNER", "PARTNER", "COORDINATOR"] as const;

const sendInquirySchema = z.object({
  workspaceId: z.string().uuid(),
  vendorId: z.string().uuid(),
  message: z.string().min(10).max(2000),
  contactMethod: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
});

export interface SendInquiryResult {
  success: boolean;
  inquiryId: string;
  message: string;
}

/**
 * Kirim inquiry ke vendor dari dashboard.
 * Rate limited: 5 inquiry per menit.
 */
export async function sendVendorInquiryAction(
  workspaceId: string,
  vendorId: string,
  message: string,
  contactMethod: "EMAIL" | "PHONE" | "WHATSAPP"
): Promise<SendInquiryResult> {
  const input = sendInquirySchema.parse({ workspaceId, vendorId, message, contactMethod });

  return withWorkspace(
    { workspaceId: input.workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const [inquiry] = await tx.insert(vendorInquiries).values({
        workspaceId: input.workspaceId,
        vendorId: input.vendorId,
        message: input.message,
        contactMethod: input.contactMethod,
        status: "SENT",
      }).returning();

      revalidatePath("/vendors");

      return {
        success: true,
        inquiryId: inquiry.id,
        message: "Inquiry berhasil dikirim ke vendor.",
      };
    }
  );
}

/**
 * Submit review untuk vendor.
 * Satu review per workspace per vendor.
 */
export async function submitVendorReviewAction(
  workspaceId: string,
  vendorId: string,
  rating: number,
  reviewText?: string
): Promise<{ success: boolean; message: string }> {
  const schema = z.object({
    workspaceId: z.string().uuid(),
    vendorId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    reviewText: z.string().max(1000).optional(),
  });

  schema.parse({ workspaceId, vendorId, rating, reviewText });

  return withWorkspace(
    { workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      // Check if already reviewed
      const existing = await tx
        .select()
        .from(vendorReviews)
        .where(
          and(
            eq(vendorReviews.workspaceId, workspaceId),
            eq(vendorReviews.vendorId, vendorId)
          )
        );

      if (existing.length > 0) {
        return {
          success: false,
          message: "Anda sudah memberikan review untuk vendor ini.",
        };
      }

      await tx.insert(vendorReviews).values({
        workspaceId,
        vendorId,
        rating,
        reviewText: reviewText || null,
      });

      revalidatePath("/vendors");

      return {
        success: true,
        message: "Review berhasil dikirim.",
      };
    }
  );
}

/**
 * Ambil semua inquiry untuk workspace.
 */
export async function getVendorInquiriesAction(
  workspaceId: string
): Promise<any[]> {
  const input = z.string().uuid().parse(workspaceId);

  return withWorkspace(
    { workspaceId: input, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR", "FAMILY"] },
    async (tx) => {
      return tx
        .select()
        .from(vendorInquiries)
        .where(eq(vendorInquiries.workspaceId, input))
        .orderBy(vendorInquiries.createdAt);
    }
  );
}

/**
 * Update status inquiry.
 */
export async function updateInquiryStatusAction(
  workspaceId: string,
  inquiryId: string,
  status: "REPLIED" | "CLOSED" | "SENT"
): Promise<{ success: boolean; message: string }> {
  const schema = z.object({
    workspaceId: z.string().uuid(),
    inquiryId: z.string().uuid(),
    status: z.enum(["REPLIED", "CLOSED", "SENT"]),
  });

  schema.parse({ workspaceId, inquiryId, status });

  return withWorkspace(
    { workspaceId, allowedRoles: editorRoles },
    async (tx) => {
      const updateData: any = { status };
      if (status === "REPLIED") {
        updateData.repliedAt = new Date();
      }

      await tx
        .update(vendorInquiries)
        .set(updateData)
        .where(
          and(
            eq(vendorInquiries.id, inquiryId),
            eq(vendorInquiries.workspaceId, workspaceId)
          )
        );

      revalidatePath("/vendors/inquiry");

      return {
        success: true,
        message: "Status inquiry berhasil diupdate.",
      };
    }
  );
}

/**
 * Cek apakah sudah review vendor ini.
 */
export async function hasReviewedVendorAction(
  workspaceId: string,
  vendorId: string
): Promise<boolean> {
  const schema = z.object({
    workspaceId: z.string().uuid(),
    vendorId: z.string().uuid(),
  });

  schema.parse({ workspaceId, vendorId });

  return withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR", "FAMILY"] },
    async (tx) => {
      const [review] = await tx
        .select()
        .from(vendorReviews)
        .where(
          and(
            eq(vendorReviews.workspaceId, workspaceId),
            eq(vendorReviews.vendorId, vendorId)
          )
        );

      return !!review;
    }
  );
}
