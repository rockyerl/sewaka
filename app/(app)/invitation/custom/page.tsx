import { Suspense } from "react";
import { getInvitationCustomByWorkspace } from "@/features/invitation-custom/hooks/invitation-custom-queries";
import { listWorkspaceImages } from "@/features/gallery/hooks/gallery-queries";
import { InvitationCustomPage } from "@/features/invitation-custom/components/invitation-custom-page";

export const metadata = {
  title: "Custom Undangan",
  description: "Atur tampilan undangan pernikahanmu",
};

export default async function InvitationCustomRoutePage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/utils/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) return null;

  const [custom, galleryImages] = await Promise.all([
    getInvitationCustomByWorkspace(workspace.id),
    listWorkspaceImages(workspace.id),
  ]);

  const customData = custom ? {
    couplePhotoUrl: custom.couplePhotoUrl,
    theme: custom.theme || "emas",
    musicUrl: custom.musicUrl,
    story: custom.story,
    storyTimeline: custom.storyTimeline as any[] | null,
    galleryImageIds: custom.galleryImageIds as string[] | null,
    giftAccounts: custom.giftAccounts as any[] | null,
    videoUrl: custom.videoUrl,
    liveStreamUrl: custom.liveStreamUrl,
    customFont: custom.customFont,
    backgroundImageUrl: custom.backgroundImageUrl,
    heroPhotoUrls: custom.heroPhotoUrls as string[] | null,
    enableAnimations: custom.enableAnimations,
    enabled: custom.enabled,
  } : null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvitationCustomPage
        workspaceId={workspace.id}
        invitationSlug={workspace.invitationSlug}
        custom={customData}
        galleryImages={galleryImages}
      />
    </Suspense>
  );
}
