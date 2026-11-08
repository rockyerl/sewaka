/**
 * Notifications feature types
 * Corresponds to: notifications, pushNotificationSubscriptions, whatsappNotifications tables
 */

export type NotificationType = 'TASK_REMINDER' | 'DUE_DATE' | 'BUDGET_ALERT' | 'INVITATION' | 'SYSTEM';
export type NotificationReadStatus = 'UNREAD' | 'READ';

export interface Notification {
  id: string;
  workspaceId: string | null;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: Date | null;
  data: Record<string, unknown> | null;
  createdAt: Date;
}

export interface PushNotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dhKey: string;
  auth: string;
  createdAt: Date;
}

export interface WhatsappNotification {
  id: string;
  workspaceId: string;
  phoneNumber: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt: Date | null;
  createdAt: Date;
}
