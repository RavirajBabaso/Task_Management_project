import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import * as reportService from '../services/reportService';
import { errorResponse, successResponse } from '../utils/responseHelper';

const parseOptionalDeptId = (value: unknown) => {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }

  const departmentId = Number(value);
  if (Number.isNaN(departmentId) || departmentId <= 0) {
    const error = new Error('Department id must be a positive integer') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return departmentId;
};

const requireUserId = (req: Request) => {
  if (!req.user) {
    const error = new Error('Authentication is required') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  return req.user.id;
};

export const getDailyReport = async (req: Request, res: Response) => {
  const { date } = req.query;

  if (typeof date !== 'string' || !date) {
    return errorResponse(res, 'Query parameter "date" is required', 400);
  }

  const result = await reportService.generateDailyReport(
    date,
    parseOptionalDeptId(req.query.dept),
    requireUserId(req)
  );

  return successResponse(res, result, 'Daily report generated successfully');
};

export const getWeeklyReport = async (req: Request, res: Response) => {
  const { week } = req.query;

  if (typeof week !== 'string' || !week) {
    return errorResponse(res, 'Query parameter "week" is required', 400);
  }

  const result = await reportService.generateWeeklyReport(
    week,
    parseOptionalDeptId(req.query.dept),
    requireUserId(req)
  );

  return successResponse(res, result, 'Weekly report generated successfully');
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  const { year, month } = req.query;

  if (typeof year !== 'string' || typeof month !== 'string' || !year || !month) {
    return errorResponse(res, 'Query parameters "year" and "month" are required', 400);
  }

  const yearNumber = Number(year);
  const monthNumber = Number(month);

  if (
    Number.isNaN(yearNumber) ||
    Number.isNaN(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return errorResponse(res, 'Year or month is invalid', 400);
  }

  const result = await reportService.generateMonthlyReport(
    yearNumber,
    monthNumber,
    parseOptionalDeptId(req.query.dept),
    requireUserId(req)
  );

  return successResponse(res, result, 'Monthly report generated successfully');
};

export const downloadReport = async (req: Request, res: Response) => {
  const reportId = Number(req.params.id);
  const format = req.query.format === 'excel' ? 'excel' : req.query.format === 'pdf' ? 'pdf' : null;

  if (Number.isNaN(reportId) || reportId <= 0) {
    return errorResponse(res, 'Report id must be a positive integer', 400);
  }

  if (!format) {
    return errorResponse(res, 'Query parameter "format" must be "pdf" or "excel"', 400);
  }

  const reportRecord = await reportService.getReportById(reportId);

  if (!reportRecord) {
    return errorResponse(res, 'Report not found', 404);
  }

  const targetPath = format === 'pdf' ? reportRecord.paths.pdf : reportRecord.paths.excel;

  if (!fs.existsSync(targetPath)) {
    return errorResponse(res, 'Report file not found on disk', 404);
  }

  const fileName = path.basename(targetPath);
  const contentType =
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const stream = fs.createReadStream(targetPath);
  stream.pipe(res);
};

export const getReportHistory = async (_req: Request, res: Response) => {
  const reports = await reportService.getReportHistory();
  return successResponse(res, reports, 'Report history fetched successfully');
};
