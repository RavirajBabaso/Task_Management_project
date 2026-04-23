import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
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

const formatDateTime = (value: Date) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const sanitizeFilePart = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const getStatusColor = (status: string) => {
  if (status === 'COMPLETED') {
    return '#1f7a1f';
  }

  if (status === 'DELAYED' || status === 'ESCALATED') {
    return '#c62828';
  }

  return '#8a6d1d';
};

const drawSectionTitle = (doc: PDFKit.PDFDocument, title: string) => {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#0f172a').text(title);
  doc.moveDown(0.3);
};

const ensureSpace = (doc: PDFKit.PDFDocument, requiredHeight: number) => {
  if (doc.y + requiredHeight > doc.page.height - doc.page.margins.bottom - 40) {
    doc.addPage();
  }
};

const drawStats = (doc: PDFKit.PDFDocument, reportData: ReportData) => {
  const stats = [
    { label: 'Total', value: reportData.summary.total, color: '#1d4ed8' },
    { label: 'Completed', value: reportData.summary.completed, color: '#15803d' },
    { label: 'Delayed', value: reportData.summary.delayed, color: '#b91c1c' },
    { label: 'Pending', value: reportData.summary.pending, color: '#a16207' }
  ];

  const startX = doc.page.margins.left;
  const width = (doc.page.width - doc.page.margins.left - doc.page.margins.right - 24) / 4;
  const boxHeight = 56;

  ensureSpace(doc, boxHeight + 16);
  const y = doc.y;

  stats.forEach((stat, index) => {
    const x = startX + index * (width + 8);

    doc.roundedRect(x, y, width, boxHeight, 8).fillAndStroke('#f8fafc', '#dbeafe');
    doc.fillColor('#64748b').font('Helvetica').fontSize(10).text(stat.label, x + 12, y + 10);
    doc.fillColor(stat.color).font('Helvetica-Bold').fontSize(18).text(String(stat.value), x + 12, y + 24);
  });

  doc.y = y + boxHeight + 12;
};

const drawTable = (
  doc: PDFKit.PDFDocument,
  title: string,
  headers: string[],
  rows: string[][],
  widths: number[]
) => {
  drawSectionTitle(doc, title);

  const startX = doc.page.margins.left;
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const headerHeight = 24;

  ensureSpace(doc, headerHeight + 12);
  let y = doc.y;

  doc.rect(startX, y, tableWidth, headerHeight).fillAndStroke('#e2e8f0', '#cbd5e1');
  let x = startX;

  headers.forEach((header, index) => {
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(header, x + 6, y + 7, {
      width: widths[index] - 12,
      align: index === headers.length - 1 ? 'right' : 'left'
    });
    x += widths[index];
  });

  y += headerHeight;

  rows.forEach((row, rowIndex) => {
    const rowHeight = Math.max(
      22,
      ...row.map((cell, index) =>
        doc.heightOfString(cell, {
          width: widths[index] - 12,
          align: index === row.length - 1 ? 'right' : 'left'
        }) + 10
      )
    );

    ensureSpace(doc, rowHeight + 6);
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 40) {
      y = doc.y;
      doc.rect(startX, y, tableWidth, headerHeight).fillAndStroke('#e2e8f0', '#cbd5e1');
      x = startX;

      headers.forEach((header, index) => {
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(header, x + 6, y + 7, {
          width: widths[index] - 12,
          align: index === headers.length - 1 ? 'right' : 'left'
        });
        x += widths[index];
      });

      y += headerHeight;
    }

    doc.rect(startX, y, tableWidth, rowHeight)
      .fillAndStroke(rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc', '#e2e8f0');

    x = startX;
    row.forEach((cell, index) => {
      doc
        .fillColor('#0f172a')
        .font('Helvetica')
        .fontSize(8.5)
        .text(cell, x + 6, y + 5, {
          width: widths[index] - 12,
          align: index === row.length - 1 ? 'right' : 'left'
        });
      x += widths[index];
    });

    y += rowHeight;
    doc.y = y;
  });
};

const addHeader = (doc: PDFKit.PDFDocument, reportData: ReportData, type: ReportGenerationType) => {
  doc.fillColor('#1d4ed8').font('Helvetica-Bold').fontSize(22).text('EduTask Pro', { align: 'left' });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(16).text('Adhira International School');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor('#334155').text(`Report Type: ${type}`);
  doc.text(`Date Range: ${formatDate(reportData.dateFrom)} - ${formatDate(reportData.dateTo)}`);
  doc.text(`Generated On: ${formatDateTime(reportData.generatedAt)}`);

  if (reportData.departmentName) {
    doc.text(`Department: ${reportData.departmentName}`);
  }

  if (reportData.summary.performanceScore !== undefined) {
    doc.text(`Performance Score: ${reportData.summary.performanceScore.toFixed(2)} / 100`);
  }

  doc.moveDown(0.5);
  doc.strokeColor('#cbd5e1').moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.8);
};

const addFooter = (doc: PDFKit.PDFDocument) => {
  const range = doc.bufferedPageRange();

  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(range.start + index);
    const footerY = doc.page.height - doc.page.margins.bottom + 10;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(
        `Confidential - Adhira International School · Page ${index + 1} of ${range.count}`,
        doc.page.margins.left,
        footerY,
        { align: 'center' }
      );
  }
};

export const generateTaskReport = async (reportData: ReportData, type: ReportGenerationType) => {
  await ensureReportsDirectory();

  const timestamp = Date.now();
  const fileName = `${sanitizeFilePart(type)}-report-${timestamp}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    addHeader(doc, reportData, type);
    drawStats(doc, reportData);

    const departmentRows = reportData.departments.map((department) => [
      department.department,
      String(department.total),
      String(department.completed),
      String(department.delayed),
      `${department.completionPercentage.toFixed(2)}%`
    ]);

    drawTable(
      doc,
      'Department Breakdown',
      ['Department', 'Total', 'Completed', 'Delayed', 'Completion %'],
      departmentRows.length > 0 ? departmentRows : [['No department data', '-', '-', '-', '-']],
      [190, 60, 80, 70, 90]
    );

    const taskRows = reportData.tasks.map((task) => [
      task.task,
      task.assignedTo,
      task.priority,
      task.status,
      formatDate(task.dueDate),
      String(task.daysOverdue)
    ]);

    drawTable(
      doc,
      'Task Details',
      ['Task', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Days Overdue'],
      taskRows.length > 0 ? taskRows : [['No tasks found', '-', '-', '-', '-', '0']],
      [160, 110, 60, 80, 90, 60]
    );

    addFooter(doc);
    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
    doc.on('error', reject);
  });

  return filePath;
};

export const getPdfStatusColor = getStatusColor;
