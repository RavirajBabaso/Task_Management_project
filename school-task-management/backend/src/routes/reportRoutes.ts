import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import {
  downloadReport,
  getDailyReport,
  getMonthlyReport,
  getReportHistory,
  getWeeklyReport
} from '../controllers/reportController';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

router.get('/', authenticate, requireRole('CHAIRMAN'), asyncHandler(getReportHistory));
router.get('/daily', authenticate, requireRole('CHAIRMAN'), asyncHandler(getDailyReport));
router.get('/weekly', authenticate, requireRole('CHAIRMAN'), asyncHandler(getWeeklyReport));
router.get('/monthly', authenticate, requireRole('CHAIRMAN'), asyncHandler(getMonthlyReport));
router.get('/:id/download', authenticate, requireRole('CHAIRMAN'), asyncHandler(downloadReport));

export default router;
