import { Router } from 'express';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);
router.put('/read-all', authenticateToken, markAllRead);

export default router;