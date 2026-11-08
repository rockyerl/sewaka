/**
 * Tasks feature types
 * Corresponds to: tasks, taskCategories, checklistTemplates, templateTasks, taskAttachments, recurringTasks tables
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  workspaceId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string | null;
  categoryColor: string | null;
}

export interface TaskCategory {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
}

export interface TemplateTask {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  order: number;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface RecurringTask {
  id: string;
  taskId: string;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceCount: number | null;
  nextDueDate: Date;
  lastGeneratedAt: Date | null;
  createdAt: Date;
}
