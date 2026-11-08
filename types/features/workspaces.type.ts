/**
 * Workspaces feature types
 * Corresponds to: weddingWorkspaces, workspaceMembers, weddingConcepts tables
 */

export type WorkspaceRole = 'OWNER' | 'PARTNER' | 'FAMILY' | 'COORDINATOR';

export interface WeddingWorkspace {
  id: string;
  name: string;
  weddingDate: Date | null;
  venue: string | null;
  city: string | null;
  brideName: string | null;
  groomName: string | null;
  theme: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  invitedBy: string;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
}

export interface WeddingConcept {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  moodBoardUrl: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
