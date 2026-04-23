import { Router } from 'express';
import announcementRoutes from './announcementRoutes';
import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import healthRoutes from './health.routes';
import notificationRoutes from './notificationRoutes';
import reportRoutes from './reportRoutes';
import taskRoutes from './taskRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/announcements', announcementRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

export default router;
