/**
 * Shared TypeScript types for Sewaka features.
 *
 * Pattern: Each feature has its own type file in `types/features/`.
 * Database schema types are inferred from Drizzle schema in `lib/db/schema.ts`.
 * These interfaces provide readable, explicit types for components and actions.
 */

// Re-export all feature types for convenience
export type { User, LoginCredentials, RegisterData, AuthActionResult, VerificationToken } from './auth.type';
export type { TaskStatus, TaskPriority, Task, TaskCategory, ChecklistTemplate, TemplateTask, TaskAttachment, RecurringTask } from './tasks.type';
export type { Budget, BudgetCategory, Expense, ExpenseAttachment, BudgetSummary, BudgetCategorySummary } from './budget.type';
export type { VendorStatus, QuotationStatus, Vendor, VendorQuotation, VendorPayment, VendorPortfolioImage, VendorContract, Invoice, CuratedVendor } from './vendors.type';
export type { RsvpStatus, Guest, GuestImportResult } from './guests.type';
export type { WorkspaceRole, WeddingWorkspace, WorkspaceMember, WeddingConcept } from './workspaces.type';
export type { WeddingEvent } from './events.type';
export type { SubscriptionStatus, PaymentStatus, SubscriptionPlan, Subscription, PaymentTransaction } from './subscription.type';
export type { Document, DocumentShare, CreateDocumentInput } from './documents.type';
export type { NotificationType, NotificationReadStatus, Notification, PushNotificationSubscription, WhatsappNotification } from './notifications.type';
export type { ContractStatus, Contract } from './contracts.type';
export type { SeserahanStatus, SeserahanItem } from './seserahan.type';
export type { ImageGalleryItem } from './gallery.type';
export type { CulturalRundown } from './rundown.type';
export type { Comment } from './comments.type';
export type { FeatureFlag, SystemSetting, AdminAuditLog, Announcement, SupportTicket, SupportTicketMessage, AdminContent, ActivityLog } from './admin.type';
