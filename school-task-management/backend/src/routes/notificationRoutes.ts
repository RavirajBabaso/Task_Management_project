import { Router } from 'express';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllRead);

export default router;