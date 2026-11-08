/**
 * Events feature types
 * Corresponds to: weddingEvents table
 */

export interface WeddingEvent {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  eventDate: Date;
  venue: string | null;
  city: string | null;
  eventType: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
