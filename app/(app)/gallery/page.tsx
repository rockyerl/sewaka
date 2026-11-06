import { listWorkspaceImages } from "@/features/gallery/queries";
import { GalleryPageContent } from "@/features/gallery/components/gallery-page";
import { PageHeader } from "@/components/shared";

export const instant = false;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const { getCurrentWorkspace } = await import("@/lib/workspace-cache");
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace = await getCurrentWorkspace(workspaceIdFromQuery);
  if (!workspace) {
    return <p className="py-10 text-center text-muted-foreground">Workspace tidak ditemukan.</p>;
  }

  const images = await listWorkspaceImages(workspace.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="GALERI"
        title="Galeri Foto"
        description="Simpan foto referensi, inspirasi, dan momen persiapan pernikahanmu."
      />
      <GalleryPageContent workspaceId={workspace.id} images={images} />
    </div>
  );
}
