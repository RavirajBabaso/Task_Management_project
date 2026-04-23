export const USER_ROLES = [
  'CHAIRMAN',
  'DIRECTOR',
  'PROPERTY',
  'FINANCE',
  'ADMIN',
  'PRINCIPAL',
  'ADMISSION',
  'HR',
  'PURCHASE',
  'IT',
  'TRANSPORT'
] as const;

export const TASK_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;
export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ESCALATED'] as const;
export const NOTIFICATION_TYPES = [
  'TASK_ASSIGNED',
  'TASK_UPDATED',
  'TASK_DELAYED',
  'TASK_ESCALATED',
  'ANNOUNCEMENT'
] as const;
export const APPROVAL_TYPES = ['BUDGET', 'PURCHASE', 'POLICY', 'EVENT'] as const;
export const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export const ANNOUNCEMENT_TARGETS = ['ALL', 'DEPARTMENT'] as const;
export const REPORT_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type ApprovalType = (typeof APPROVAL_TYPES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type AnnouncementTarget = (typeof ANNOUNCEMENT_TARGETS)[number];
export type ReportType = (typeof REPORT_TYPES)[number];