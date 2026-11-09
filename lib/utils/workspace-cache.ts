import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth-cache";
import { listMyWorkspaces, ensureInvitationSlug } from "@/lib/hooks/workspace-queries";
import type { WorkspaceSummary } from "@/lib/schemas/workspace-schema";

// Cached getter for the current user's default workspace.
// This is cached per request, so multiple pages/components in the same request
// will share the same result instead of each calling listMyWorkspaces independently.
export const getCurrentWorkspace = cache(async (workspaceIdOverride?: string): Promise<WorkspaceSummary | null> => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return null;

  const workspaces = await listMyWorkspaces();
  if (workspaces.length === 0) return null;

  // If a specific workspaceId is requested, use it; otherwise return the first one
  let workspace = workspaceIdOverride
    ? workspaces.find((w) => w.id === workspaceIdOverride) ?? workspaces[0]
    : workspaces[0];

  // Auto-generate invitation slug if missing (legacy workspaces)
  if (!workspace.invitationSlug) {
    const updated = await ensureInvitationSlug(workspace.id);
    // Merge the updated slug back into the WorkspaceSummary shape
    workspace = { ...workspace, invitationSlug: updated.invitationSlug };
  }

  return workspace;
});

// Cached getter for all workspaces of the current user
export const getAllWorkspaces = cache(async () => {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) return [];

  return listMyWorkspaces();
});
