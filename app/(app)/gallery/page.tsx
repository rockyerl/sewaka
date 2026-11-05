import { auth } from "@/auth";
import { listMyWorkspaces } from "@/features/workspaces/queries";
import { listWorkspaceImages } from "@/features/gallery/queries";
import { GalleryPageContent } from "@/features/gallery/components/gallery-page";

export const instant = false;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery = typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
    ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
    : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) {
    return <p className="py-10 text-center text-muted-foreground">Workspace tidak ditemukan.</p>;
  }

  const images = await listWorkspaceImages(workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Galeri Foto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simpan foto referensi, inspirasi, dan momen persiapan pernikahanmu.
        </p>
      </div>
      <GalleryPageContent workspaceId={workspace.id} images={images} />
    </div>
  );
}
