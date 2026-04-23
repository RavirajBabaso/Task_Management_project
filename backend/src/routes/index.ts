import { Router } from 'express';
import approvalRoutes from './approvalRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// Mount approval routes at /approvals
router.use('/approvals', approvalRoutes);
// Mount dashboard routes at /dashboard
router.use('/dashboard', dashboardRoutes);

export default router;