import { Router } from 'express';
import approvalRoutes from './approvalRoutes';

const router = Router();

// Mount approval routes at /approvals
router.use('/approvals', approvalRoutes);

export default router;