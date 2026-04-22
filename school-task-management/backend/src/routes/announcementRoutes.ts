import { Router } from 'express';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/', authenticate, requireRole('CHAIRMAN'), createAnnouncement);
router.get('/', authenticate, getAnnouncements);

export default router;