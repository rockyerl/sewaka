/**
 * Subscription feature types
 * Corresponds to: subscriptionPlans, subscriptions, paymentTransactions, invoices tables
 */

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  interval: 'MONTHLY' | 'YEARLY';
  features: Record<string, boolean>;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  workspaceId: string;
  subscriptionId: string | null;
  amount: string;
  status: PaymentStatus;
  provider: string;
  providerTransactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
