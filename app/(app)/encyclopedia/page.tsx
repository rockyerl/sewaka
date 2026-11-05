import { listMyWorkspaces } from "@/features/workspaces/queries";
import { getEncyclopediaArticles } from "@/features/encyclopedia/queries/encyclopedia-queries";
import { CulturalEncyclopediaView } from "@/features/encyclopedia/components/cultural-encyclopedia-view";

export const instant = false;

export default async function EncyclopediaPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string }>;
}) {
  const workspaces = await listMyWorkspaces();
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const workspaceIdFromQuery =
    typeof resolvedSearchParams === "object" && resolvedSearchParams !== null
      ? (resolvedSearchParams as { workspaceId?: string }).workspaceId
      : undefined;

  const workspace =
    workspaces.find((item) => item.id === workspaceIdFromQuery) ?? workspaces[0];
  if (!workspace) return null;

  const articles = await getEncyclopediaArticles();

  return (
    <CulturalEncyclopediaView
      workspaceId={workspace.id}
      articles={articles}
      userTradition={workspace.culturalTradition}
    />
  );
}
