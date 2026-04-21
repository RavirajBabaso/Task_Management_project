export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'ESCALATED';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  assigned_by: number;
  assigned_to: number;
  department_id: number | null;
  priority: TaskPriority;
  status: TaskStatus;
  start_date: string;
  due_date: string;
  attachment_path: string | null;
  completed_at: string | null;
  assignedByName?: string;
  assignedToName?: string;
  departmentName?: string;
}

export interface TaskHistory {
  id: number;
  task_id: number;
  updated_by: number;
  old_status: TaskStatus | null;
  new_status: TaskStatus;
  comment: string | null;
  updated_at: string;
  updatedByName?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigned_to: number;
  department_id?: number | null;
  priority: TaskPriority;
  start_date: string;
  due_date: string;
  attachment?: File;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assigned_to?: number;
  department_id?: number | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  start_date?: string;
  due_date?: string;
  completed_at?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  department_id?: number | null;
  assigned_to?: number | null;
  search?: string;
  date_from?: string;
  date_to?: string;
}
