/**
 * Guests feature types
 * Corresponds to: guests table
 */

export type RsvpStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Guest {
  id: string;
  workspaceId: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: RsvpStatus;
  mealPreference: string | null;
  guestCount: number;
  tableNumber: string | null;
  notes: string | null;
  isCheckedIn: boolean;
  checkedInAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestImportResult {
  success: number;
  failed: number;
  errors: string[];
}
