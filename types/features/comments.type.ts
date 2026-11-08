/**
 * Comments feature types
 * Corresponds to: comments table
 */

export interface Comment {
  id: string;
  workspaceId: string;
  targetId: string;
  targetType: 'VENDOR' | 'TASK' | 'DOCUMENT' | 'EVENT';
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
}
