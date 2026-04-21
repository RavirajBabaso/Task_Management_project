export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_DELAYED'
  | 'TASK_ESCALATED'
  | 'ANNOUNCEMENT';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  message: string;
  task_id: number | null;
  is_read: boolean;
  created_at: string;
}

export type AnnouncementTarget = 'ALL' | 'DEPARTMENT';

export interface Announcement {
  id: number;
  created_by: number;
  target: AnnouncementTarget;
  message: string;
  department_id: number | null;
  created_at: string;
}
