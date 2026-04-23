import { Report, Task, User, Department } from '../models';
import {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  getReportHistory,
  parseStoredReportPaths
} from '../services/reportService';
import { generateTaskReport } from '../utils/pdfGenerator';
import { generateTaskExcel } from '../utils/excelGenerator';

// Mock the utilities
const mockGenerateTaskReport = generateTaskReport as jest.MockedFunction<typeof generateTaskReport>;
const mockGenerateTaskExcel = generateTaskExcel as jest.MockedFunction<typeof generateTaskExcel>;

// Mock the models
const mockReport = {
  id: 1,
  type: 'DAILY',
  generated_by: 1,
  file_path: JSON.stringify({ pdf: '/path/to/report.pdf', excel: '/path/to/report.xlsx' }),
  department_id: null,
  date_from: new Date('2024-01-01'),
  date_to: new Date('2024-01-01'),
  created_at: new Date(),
  generatedBy: { id: 1, name: 'Generator', role: 'CHAIRMAN' },
  department: null
};

const mockTask = {
  id: 1,
  title: 'Test Task',
  status: 'COMPLETED',
  due_date: new Date('2024-01-01'),
  assignedTo: { name: 'Assignee' },
  department: { name: 'IT Department' }
};

describe('Report Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyReport', () => {
    it('should return PDF and Excel file paths', async () => {
      const date = '2024-01-01';

      mockGenerateTaskReport.mockResolvedValue('/path/to/report.pdf');
      mockGenerateTaskExcel.mockResolvedValue('/path/to/report.xlsx');
      (Task.findAll as jest.Mock).mockResolvedValue([mockTask]);
      (Department.findByPk as jest.Mock).mockResolvedValue(null);
      (Report.create as jest.Mock).mockResolvedValue(mockReport);

      const result = await generateDailyReport(date);

      expect(Task.findAll).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DAILY',
          generated_by: 1,
          file_path: expect.any(String),
          department_id: null,
          date_from: expect.any(Date),
          date_to: expect.any(Date)
        })
      );

      expect(result).toEqual({
        reportId: 1,
        pdfPath: expect.any(String),
        excelPath: expect.any(String)
      });
    });
  });

  describe('generateWeeklyReport', () => {
    it('should return PDF and Excel file paths for weekly report', async () => {
      const weekStart = '2024-01-01';

      mockGenerateTaskReport.mockResolvedValue('/path/to/report.pdf');
      mockGenerateTaskExcel.mockResolvedValue('/path/to/report.xlsx');
      (Task.findAll as jest.Mock).mockResolvedValue([mockTask]);
      (Department.findByPk as jest.Mock).mockResolvedValue(null);
      (Report.create as jest.Mock).mockResolvedValue(mockReport);

      const result = await generateWeeklyReport(weekStart);

      expect(Task.findAll).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'WEEKLY',
          generated_by: 1,
          file_path: expect.any(String),
          department_id: null
        })
      );

      expect(result).toEqual({
        reportId: 1,
        pdfPath: expect.any(String),
        excelPath: expect.any(String)
      });
    });
  });

  describe('generateMonthlyReport', () => {
    it('should return PDF and Excel file paths for monthly report', async () => {
      const year = 2024;
      const month = 1;

      mockGenerateTaskReport.mockResolvedValue('/path/to/report.pdf');
      mockGenerateTaskExcel.mockResolvedValue('/path/to/report.xlsx');
      (Task.findAll as jest.Mock).mockResolvedValue([mockTask]);
      (Department.findByPk as jest.Mock).mockResolvedValue(null);
      (Report.create as jest.Mock).mockResolvedValue(mockReport);

      const result = await generateMonthlyReport(year, month);

      expect(Task.findAll).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'MONTHLY',
          generated_by: 1,
          file_path: expect.any(String),
          department_id: null
        })
      );

      expect(result).toEqual({
        reportId: 1,
        pdfPath: expect.any(String),
        excelPath: expect.any(String)
      });
    });
  });

  describe('getReportHistory', () => {
    it('should return formatted report history', async () => {
      (Report.findAll as jest.Mock).mockResolvedValue([mockReport]);

      const result = await getReportHistory();

      expect(Report.findAll).toHaveBeenCalledWith({
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

      expect(result).toEqual([
        {
          id: 1,
          type: 'DAILY',
          generatedBy: { id: 1, name: 'Generator', role: 'CHAIRMAN' },
          department: null,
          dateFrom: expect.any(Date),
          dateTo: expect.any(Date),
          createdAt: expect.any(Date),
          pdfPath: '/path/to/report.pdf',
          excelPath: '/path/to/report.xlsx'
        }
      ]);
    });
  });

  describe('parseStoredReportPaths', () => {
    it('should parse valid JSON file paths', () => {
      const filePathValue = JSON.stringify({
        pdf: '/path/to/report.pdf',
        excel: '/path/to/report.xlsx'
      });

      const result = parseStoredReportPaths(filePathValue);

      expect(result).toEqual({
        pdf: '/path/to/report.pdf',
        excel: '/path/to/report.xlsx'
      });
    });

    it('should handle legacy string format', () => {
      const filePathValue = '/legacy/path/report.pdf';

      const result = parseStoredReportPaths(filePathValue);

      expect(result).toEqual({
        pdf: '/legacy/path/report.pdf',
        excel: '/legacy/path/report.pdf'
      });
    });

    it('should handle invalid JSON gracefully', () => {
      const filePathValue = 'invalid json';

      const result = parseStoredReportPaths(filePathValue);

      expect(result).toEqual({
        pdf: 'invalid json',
        excel: 'invalid json'
      });
    });

    it('should handle incomplete JSON', () => {
      const filePathValue = JSON.stringify({ pdf: '/path.pdf' });

      const result = parseStoredReportPaths(filePathValue);

      expect(result).toEqual({
        pdf: filePathValue,
        excel: filePathValue
      });
    });
  });

  describe('Database insertion', () => {
    it('should insert records in DB with correct paths', async () => {
      mockGenerateTaskReport.mockResolvedValue('/path/to/report.pdf');
      mockGenerateTaskExcel.mockResolvedValue('/path/to/report.xlsx');
      (Task.findAll as jest.Mock).mockResolvedValue([mockTask]);
      (Department.findByPk as jest.Mock).mockResolvedValue(null);

      await generateDailyReport('2024-01-01');

      expect(Report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DAILY',
          generated_by: 1,
          file_path: expect.stringContaining('pdf'),
          department_id: null,
          date_from: expect.any(Date),
          date_to: expect.any(Date),
          created_at: expect.any(Date)
        })
      );
    });
  });
});