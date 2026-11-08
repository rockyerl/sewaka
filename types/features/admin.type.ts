/**
 * Admin feature types
 * Corresponds to: featureFlags, systemSettings, adminAuditLogs, announcements,
 * supportTickets, supportTicketMessages, adminContents, activityLogs tables
 */

export interface FeatureFlag {
  id: string;
  key: string;
  title: string;
  description: string | null;
  isEnabled: boolean;
  targetAudience: 'ALL' | 'ADMIN' | 'SPECIFIC_WORKSPACES';
  targetWorkspaceIds: string[] | null;
  enabledBy: string | null;
  enabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'MAINTENANCE';
  isActive: boolean;
  targetWorkspaceId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  workspaceId: string | null;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  isInternal: boolean;
  content: string;
  createdAt: Date;
}

export interface AdminContent {
  id: string;
  type: string;
  title: string;
  body: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  createdAt: Date;
}
