/**
 * Vendors feature types
 * Corresponds to: vendors, vendorQuotations, vendorPayments, vendorPortfolioImages, vendorContracts, invoices tables
 */

export type VendorStatus = 'SHORTLISTED' | 'CONTACTED' | 'BOOKED';
export type QuotationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Vendor {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: VendorStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorQuotation {
  id: string;
  vendorId: string;
  workspaceId: string;
  amount: string;
  description: string | null;
  status: QuotationStatus;
  validUntil: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  workspaceId: string;
  amount: string;
  paymentDate: Date;
  method: string;
  note: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorPortfolioImage {
  id: string;
  vendorId: string;
  imageUrl: string;
  caption: string | null;
  order: number;
  createdAt: Date;
}

export interface VendorContract {
  id: string;
  vendorId: string;
  workspaceId: string;
  title: string;
  fileUrl: string;
  signedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  vendorId: string;
  workspaceId: string;
  invoiceNumber: string;
  amount: string;
  dueDate: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  fileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuratedVendor {
  id: string;
  name: string;
  category: string;
  tradition: string;
  description: string;
  imageUrl: string | null;
  website: string | null;
  phone: string | null;
  isVerified: boolean;
  rating: number | null;
  createdAt: Date;
}
