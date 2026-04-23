import { Op } from 'sequelize';
import { Department, Report, ReportType, Task, User } from '../models';
import { ReportData, ReportDepartmentSummary, ReportTaskRow, StoredReportPaths } from '../types/report';
import { generateTaskExcel } from '../utils/excelGenerator';
import { generateTaskReport } from '../utils/pdfGenerator';

const REPORT_TASK_INCLUDE = [
  {
    model: User,
    as: 'assignedTo',
    attributes: ['id', 'name']
  },
  {
    model: Department,
    as: 'department',
    attributes: ['id', 'name']
  }
];

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
const endOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);

const safePercentage = (completed: number, total: number) =>
  total === 0 ? 0 : Number(((completed / total) * 100).toFixed(2));

const calculatePerformanceScore = (completed: number, delayed: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  const score = ((completed * 100) - delayed * 35) / total;
  return Number(Math.max(0, Math.min(100, score)).toFixed(2));
};

const getPendingCount = (tasks: Task[]) =>
  tasks.filter((task) => task.status === 'PENDING' || task.status === 'IN_PROGRESS').length;

const getDelayedCount = (tasks: Task[]) =>
  tasks.filter((task) => task.status === 'DELAYED' || task.status === 'ESCALATED').length;

const buildTaskRow = (task: Task): ReportTaskRow => {
  const dueDate = new Date(task.due_date);
  const now = new Date();
  const isOpenTask = task.status !== 'COMPLETED';
  const overdueMs = isOpenTask ? now.getTime() - dueDate.getTime() : 0;
  const daysOverdue = overdueMs > 0 ? Math.floor(overdueMs / (1000 * 60 * 60 * 24)) : 0;

  return {
    id: task.id,
    task: task.title,
    assignedTo: task.assignedTo?.name ?? 'Unassigned',
    priority: task.priority,
    status: task.status,
    dueDate,
    daysOverdue,
    department: task.department?.name ?? 'Unassigned'
  };
};

const buildDepartmentSummaries = (tasks: Task[]): ReportDepartmentSummary[] => {
  const departmentMap = new Map<string, Task[]>();

  tasks.forEach((task) => {
    const departmentName = task.department?.name ?? 'Unassigned';
    const departmentTasks = departmentMap.get(departmentName) ?? [];
    departmentTasks.push(task);
    departmentMap.set(departmentName, departmentTasks);
  });

  return Array.from(departmentMap.entries())
    .map(([department, departmentTasks]) => {
      const total = departmentTasks.length;
      const completed = departmentTasks.filter((task) => task.status === 'COMPLETED').length;
      const delayed = getDelayedCount(departmentTasks);
      const pending = getPendingCount(departmentTasks);

      return {
        department,
        total,
        completed,
        delayed,
        pending,
        completionPercentage: safePercentage(completed, total),
        performanceScore: calculatePerformanceScore(completed, delayed, total)
      };
    })
    .sort((left, right) => left.department.localeCompare(right.department));
};

const buildReportData = async (
  type: ReportType,
  dateFrom: Date,
  dateTo: Date,
  deptId?: number
) => {
  const [tasks, department] = await Promise.all([
    Task.findAll({
      where: {
        due_date: {
          [Op.gte]: dateFrom,
          [Op.lte]: dateTo
        },
        ...(deptId ? { department_id: deptId } : {})
      },
      include: REPORT_TASK_INCLUDE,
      order: [['due_date', 'ASC'], ['title', 'ASC']]
    }),
    deptId ? Department.findByPk(deptId) : Promise.resolve(null)
  ]);

  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
  const delayed = getDelayedCount(tasks);
  const pending = getPendingCount(tasks);
  const total = tasks.length;
  const departments = buildDepartmentSummaries(tasks);

  const reportData: ReportData = {
    generatedAt: new Date(),
    periodLabel: type,
    dateFrom,
    dateTo,
    departmentName: department?.name ?? null,
    summary: {
      total,
      completed,
      delayed,
      pending,
      completionPercentage: safePercentage(completed, total),
      performanceScore: type === 'MONTHLY' ? calculatePerformanceScore(completed, delayed, total) : undefined
    },
    departments,
    tasks: tasks.map(buildTaskRow)
  };

  return reportData;
};

const storeReportRecord = async (
  type: ReportType,
  generatedBy: number,
  deptId: number | undefined,
  dateFrom: Date,
  dateTo: Date,
  paths: StoredReportPaths
) => {
  const report = await Report.create({
    type,
    generated_by: generatedBy,
    file_path: JSON.stringify(paths),
    department_id: deptId ?? null,
    date_from: dateFrom,
    date_to: dateTo,
    created_at: new Date()
  } as Report);

  return report;
};

export const parseStoredReportPaths = (filePathValue: string): StoredReportPaths => {
  try {
    const parsed = JSON.parse(filePathValue) as Partial<StoredReportPaths>;

    if (typeof parsed.pdf === 'string' && typeof parsed.excel === 'string') {
      return {
        pdf: parsed.pdf,
        excel: parsed.excel
      };
    }
  } catch {
    // ignore legacy path format
  }

  return {
    pdf: filePathValue,
    excel: filePathValue
  };
};

const generateAndPersistReport = async (
  type: ReportType,
  dateFrom: Date,
  dateTo: Date,
  deptId?: number,
  generatedBy = 1
) => {
  const reportData = await buildReportData(type, dateFrom, dateTo, deptId);
  const [pdfPath, excelPath] = await Promise.all([
    generateTaskReport(reportData, type),
    generateTaskExcel(reportData, type)
  ]);

  const report = await storeReportRecord(type, generatedBy, deptId, dateFrom, dateTo, {
    pdf: pdfPath,
    excel: excelPath
  });

  return {
    reportId: report.id,
    pdfPath,
    excelPath
  };
};

export const generateDailyReport = async (date: string | Date, deptId?: number, generatedBy = 1) => {
  const reportDate = new Date(date);
  return generateAndPersistReport('DAILY', startOfDay(reportDate), endOfDay(reportDate), deptId, generatedBy);
};

export const generateWeeklyReport = async (
  weekStart: string | Date,
  deptId?: number,
  generatedBy = 1
) => {
  const startDate = startOfDay(new Date(weekStart));
  const endDate = endOfDay(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6));
  return generateAndPersistReport('WEEKLY', startDate, endDate, deptId, generatedBy);
};

export const generateMonthlyReport = async (
  year: number,
  month: number,
  deptId?: number,
  generatedBy = 1
) => {
  const startDate = startOfDay(new Date(year, month - 1, 1));
  const endDate = endOfDay(new Date(year, month, 0));
  return generateAndPersistReport('MONTHLY', startDate, endDate, deptId, generatedBy);
};

export const getReportHistory = async () => {
  const reports = await Report.findAll({
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'generatedBy',
        attributes: ['id', 'name', 'role']
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return reports.map((report) => {
    const paths = parseStoredReportPaths(report.file_path);

    return {
      id: report.id,
      type: report.type,
      generatedBy: report.generatedBy,
      department: report.department,
      dateFrom: report.date_from,
      dateTo: report.date_to,
      createdAt: report.created_at,
      pdfPath: paths.pdf,
      excelPath: paths.excel
    };
  });
};

export const getReportById = async (id: number) => {
  const report = await Report.findByPk(id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'generatedBy',
        attributes: ['id', 'name', 'role']
      }
    ]
  });

  if (!report) {
    return null;
  }

  return {
    report,
    paths: parseStoredReportPaths(report.file_path)
  };
};
