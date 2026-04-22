import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import {
  getChairmanDashboard,
  getDeptDashboard,
  getMonthlyComparison,
  getStaffPerformance
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

router.get('/chairman', authenticate, requireRole('CHAIRMAN'), asyncHandler(getChairmanDashboard));

router.get(
  '/dept/:deptId',
  authenticate,
  param('deptId').isInt({ min: 1 }).withMessage('Department id must be a positive integer'),
  handleValidationErrors,
  asyncHandler(getDeptDashboard)
);

router.get('/performance', authenticate, requireRole('CHAIRMAN'), asyncHandler(getStaffPerformance));

router.get(
  '/monthly-comparison',
  authenticate,
  requireRole('CHAIRMAN'),
  asyncHandler(getMonthlyComparison)
);

export default router;
