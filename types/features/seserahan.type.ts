/**
 * Seserahan feature types
 * Corresponds to: culturalSeserahanItems table
 */

export type SeserahanStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface SeserahanItem {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: string | null;
  totalPrice: string | null;
  status: SeserahanStatus;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
