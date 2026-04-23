import { ReportType, TaskPriority, TaskStatus } from '../models';

export interface ReportTaskRow {
  id: number;
  task: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  daysOverdue: number;
  department: string;
}

export interface ReportDepartmentSummary {
  department: string;
  total: number;
  completed: number;
  delayed: number;
  pending: number;
  completionPercentage: number;
  performanceScore?: number;
}

export interface ReportSummaryStats {
  total: number;
  completed: number;
  delayed: number;
  pending: number;
  completionPercentage: number;
  performanceScore?: number;
}

export interface ReportData {
  generatedAt: Date;
  periodLabel: string;
  dateFrom: Date;
  dateTo: Date;
  departmentName?: string | null;
  summary: ReportSummaryStats;
  departments: ReportDepartmentSummary[];
  tasks: ReportTaskRow[];
}

export interface StoredReportPaths {
  pdf: string;
  excel: string;
}

export type ReportGenerationType = ReportType;
