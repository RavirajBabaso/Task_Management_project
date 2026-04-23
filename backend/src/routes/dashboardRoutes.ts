import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getPerformanceAnalytics,
  getMonthlyComparison,
  getDepartmentAnalytics
} from '../controllers/dashboardController';

const router = Router();

router.get(
  '/performance',
  authenticateToken,
  requireRole('CHAIRMAN'),
  getPerformanceAnalytics
);
router.get(
  '/monthly-comparison',
  authenticateToken,
  requireRole('CHAIRMAN'),
  getMonthlyComparison
);
router.get(
  '/dept-analytics',
  authenticateToken,
  requireRole('CHAIRMAN'),
  getDepartmentAnalytics
);

export default router;
