/**
 * Documents feature types
 * Corresponds to: documents, documentShares tables
 */

export interface Document {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string | null;
  isShared: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  sharedWith: string;
  permission: 'VIEW' | 'EDIT';
  expiresAt: Date | null;
  createdAt: Date;
}

export interface CreateDocumentInput {
  title: string;
  description?: string;
  category?: string;
}
