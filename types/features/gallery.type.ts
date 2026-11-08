/**
 * Gallery feature types
 * Corresponds to: imageGallery table
 */

export interface ImageGalleryItem {
  id: string;
  workspaceId: string;
  imageUrl: string;
  caption: string | null;
  category: string | null;
  order: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
