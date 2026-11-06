import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import { listMyWorkspaces } from "@/lib/workspace-queries";

// Cached getter for the current user's default workspace.
// This is cached per request, so multiple pages/components in the same request
// will share the same result instead of each calling listMyWorkspaces independently.
export const getCurrentWorkspace = cache(async (workspaceIdOverride?: string) => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const workspaces = await listMyWorkspaces();
  if (workspaces.length === 0) return null;

  // If a specific workspaceId is requested, use it; otherwise return the first one
  const workspace = workspaceIdOverride
    ? workspaces.find((w) => w.id === workspaceIdOverride) ?? workspaces[0]
    : workspaces[0];

  return workspace;
});

// Cached getter for all workspaces of the current user
export const getAllWorkspaces = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return [];

  return listMyWorkspaces();
});
