/**
 * Rundown feature types
 * Corresponds to: culturalRundowns table
 */

export interface CulturalRundown {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  startTime: Date | null;
  endTime: Date | null;
  location: string | null;
  notes: string | null;
  order: number;
  tradition: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
