import { Router } from 'express';
import authRoutes from './authRoutes';
import healthRoutes from './health.routes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export default router;
