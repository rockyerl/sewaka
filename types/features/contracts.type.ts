/**
 * Contracts feature types
 * Corresponds to: vendorContracts table
 */

export type ContractStatus = 'DRAFT' | 'PENDING' | 'SIGNED' | 'CANCELLED';

export interface Contract {
  id: string;
  vendorId: string;
  workspaceId: string;
  title: string;
  fileUrl: string;
  status: ContractStatus;
  signedAt: Date | null;
  signedBy: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  vendorName: string | null;
}
