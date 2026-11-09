"use server";

import { eq } from "drizzle-orm";
import { invitationCustomization } from "@/lib/db/schema";
import { auth } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { withWorkspace } from "@/lib/db/with-workspace";
import { checkStorageLimit } from "@/lib/utils/subscription-check";

export async function updateInvitationCustomAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const couplePhotoUrl = (formData.get("couplePhotoUrl") as string) || null;
  const theme = formData.get("theme") as string;
  const musicUrl = (formData.get("musicUrl") as string) || null;
  const story = (formData.get("story") as string) || null;
  const galleryImageIdsRaw = formData.get("galleryImageIds") as string;
  const giftAccountsRaw = formData.get("giftAccounts") as string;
  const storyTimelineRaw = formData.get("storyTimeline") as string;
  const heroPhotoUrlsRaw = formData.get("heroPhotoUrls") as string;
  const videoUrl = (formData.get("videoUrl") as string) || null;
  const liveStreamUrl = (formData.get("liveStreamUrl") as string) || null;
  const customFont = (formData.get("customFont") as string) || "Playfair Display";
  const backgroundImageUrl = (formData.get("backgroundImageUrl") as string) || null;
  const enableAnimations = formData.get("enableAnimations") === "on";
  const enabled = formData.get("enabled") === "on";

  let galleryImageIds: string[] | null = null;
  if (galleryImageIdsRaw) {
    try {
      galleryImageIds = JSON.parse(galleryImageIdsRaw);
    } catch {
      galleryImageIds = [];
    }
  }

  let giftAccounts: any[] | null = null;
  if (giftAccountsRaw) {
    try {
      giftAccounts = JSON.parse(giftAccountsRaw);
    } catch {
      giftAccounts = [];
    }
  }

  let storyTimeline: any[] | null = null;
  if (storyTimelineRaw) {
    try {
      const parsed = JSON.parse(storyTimelineRaw);
      // Sanitize: only keep allowed fields
      storyTimeline = Array.isArray(parsed)
        ? parsed.map((m) => ({
            date: String(m.date ?? "").slice(0, 100),
            title: String(m.title ?? "").slice(0, 200),
            description: String(m.description ?? "").slice(0, 2000),
            photo_url: m.photo_url ? String(m.photo_url).slice(0, 500) : undefined,
          }))
        : null;
    } catch {
      storyTimeline = null;
    }
  }

  let heroPhotoUrls: string[] | null = null;
  if (heroPhotoUrlsRaw) {
    try {
      const parsed = JSON.parse(heroPhotoUrlsRaw);
      heroPhotoUrls = Array.isArray(parsed) ? parsed.map((u) => String(u).slice(0, 500)) : null;
    } catch {
      heroPhotoUrls = null;
    }
  }

  const updateData = {
    couplePhotoUrl,
    theme,
    musicUrl,
    story,
    galleryImageIds,
    giftAccounts,
    storyTimeline,
    heroPhotoUrls,
    videoUrl,
    liveStreamUrl,
    customFont,
    backgroundImageUrl,
    enableAnimations,
    enabled,
  };

  await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async (tx) => {
      const [existing] = await tx.select({ id: invitationCustomization.id })
        .from(invitationCustomization)
        .where(eq(invitationCustomization.workspaceId, workspaceId))
        .limit(1);
      if (existing) {
        await tx.update(invitationCustomization).set(updateData)
          .where(eq(invitationCustomization.workspaceId, workspaceId));
      } else {
        await tx.insert(invitationCustomization).values({ workspaceId, ...updateData });
      }
    },
  );

  revalidatePath("/invitation/custom");
  return { success: true };
}

export async function uploadCouplePhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) throw new Error("File tidak valid");
  if (!workspaceId) throw new Error("Workspace tidak valid.");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Ukuran file maksimal 10MB.");
  }

  await withWorkspace(
    { workspaceId, allowedRoles: ["OWNER", "PARTNER", "COORDINATOR"] },
    async () => checkStorageLimit(workspaceId, file.size),
  );

  const { uploadFile } = await import("@/lib/utils/storage");
  const uploadResult = await uploadFile(file, {
    pathname: `couple-photo/${workspaceId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`,
  });

  return { success: true, url: uploadResult.url };
}
