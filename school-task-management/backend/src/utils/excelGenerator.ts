import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { ReportData, ReportGenerationType } from '../types/report';

const REPORTS_DIR = path.resolve(process.cwd(), 'uploads', 'reports');

const ensureReportsDirectory = async () => {
  await fs.promises.mkdir(REPORTS_DIR, { recursive: true });
};

const formatDate = (value: Date) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

const sanitizeFilePart = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const applyHeaderStyle = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1D4ED8' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'CBD5E1' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } }
    };
  });
};

const applyStatusCellStyle = (cell: ExcelJS.Cell, value: string) => {
  if (value === 'COMPLETED') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
    cell.font = { color: { argb: '166534' }, bold: true };
    return;
  }

  if (value === 'DELAYED' || value === 'ESCALATED') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
    cell.font = { color: { argb: '991B1B' }, bold: true };
  }
};

const autoFitColumns = (worksheet: ExcelJS.Worksheet) => {
  worksheet.columns.forEach((column) => {
    let maxLength = 12;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = cell.value == null ? '' : String(cell.value);
      maxLength = Math.max(maxLength, value.length + 2);
    });

    column.width = Math.min(maxLength, 40);
  });
};

export const generateTaskExcel = async (reportData: ReportData, type: ReportGenerationType) => {
  await ensureReportsDirectory();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EduTask Pro';
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet('Summary');
  const taskSheet = workbook.addWorksheet('Task Details');

  summarySheet.addRow(['EduTask Pro']);
  summarySheet.addRow(['Adhira International School']);
  summarySheet.addRow([`${type} Report`]);
  summarySheet.addRow([`Date Range: ${formatDate(reportData.dateFrom)} - ${formatDate(reportData.dateTo)}`]);
  summarySheet.addRow([`Generated On: ${new Date(reportData.generatedAt).toLocaleString('en-IN')}`]);
  if (reportData.departmentName) {
    summarySheet.addRow([`Department: ${reportData.departmentName}`]);
  }
  summarySheet.addRow([]);

  summarySheet.addRow(['Summary Metric', 'Value']);
  applyHeaderStyle(summarySheet.lastRow!);

  [
    ['Total Tasks', reportData.summary.total],
    ['Completed Tasks', reportData.summary.completed],
    ['Delayed Tasks', reportData.summary.delayed],
    ['Pending Tasks', reportData.summary.pending],
    ['Completion Percentage', `${reportData.summary.completionPercentage.toFixed(2)}%`],
    [
      'Performance Score',
      reportData.summary.performanceScore !== undefined
        ? `${reportData.summary.performanceScore.toFixed(2)} / 100`
        : 'N/A'
    ]
  ].forEach((row) => summarySheet.addRow(row));

  summarySheet.addRow([]);
  summarySheet.addRow([
    'Department',
    'Total',
    'Completed',
    'Delayed',
    'Pending',
    'Completion %',
    'Performance Score'
  ]);
  applyHeaderStyle(summarySheet.lastRow!);

  if (reportData.departments.length === 0) {
    summarySheet.addRow(['No department data', '-', '-', '-', '-', '-', '-']);
  } else {
    reportData.departments.forEach((department) => {
      summarySheet.addRow([
        department.department,
        department.total,
        department.completed,
        department.delayed,
        department.pending,
        `${department.completionPercentage.toFixed(2)}%`,
        department.performanceScore !== undefined
          ? `${department.performanceScore.toFixed(2)} / 100`
          : 'N/A'
      ]);
    });
  }

  summarySheet.addRow([]);
  summarySheet.addRow(['Task', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Days Overdue', 'Department']);
  applyHeaderStyle(summarySheet.lastRow!);

  if (reportData.tasks.length === 0) {
    summarySheet.addRow(['No tasks found', '-', '-', '-', '-', '0', '-']);
  } else {
    reportData.tasks.forEach((task) => {
      const row = summarySheet.addRow([
        task.task,
        task.assignedTo,
        task.priority,
        task.status,
        formatDate(task.dueDate),
        task.daysOverdue,
        task.department
      ]);
      applyStatusCellStyle(row.getCell(4), task.status);
    });
  }

  taskSheet.addRow([
    'Task ID',
    'Task',
    'Assigned To',
    'Priority',
    'Status',
    'Due Date',
    'Days Overdue',
    'Department'
  ]);
  applyHeaderStyle(taskSheet.lastRow!);

  if (reportData.tasks.length === 0) {
    taskSheet.addRow(['-', 'No tasks found', '-', '-', '-', '-', 0, '-']);
  } else {
    reportData.tasks.forEach((task) => {
      const row = taskSheet.addRow([
        task.id,
        task.task,
        task.assignedTo,
        task.priority,
        task.status,
        formatDate(task.dueDate),
        task.daysOverdue,
        task.department
      ]);
      applyStatusCellStyle(row.getCell(5), task.status);
    });
  }

  [summarySheet, taskSheet].forEach((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });
    autoFitColumns(sheet);
  });

  const timestamp = Date.now();
  const fileName = `${sanitizeFilePart(type)}-report-${timestamp}.xlsx`;
  const filePath = path.join(REPORTS_DIR, fileName);

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};
