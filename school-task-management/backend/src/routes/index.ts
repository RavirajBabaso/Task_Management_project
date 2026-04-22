import { Router } from 'express';
import authRoutes from './authRoutes';
import healthRoutes from './health.routes';
import taskRoutes from './taskRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
