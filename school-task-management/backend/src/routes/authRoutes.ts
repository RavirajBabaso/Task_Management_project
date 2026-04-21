import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import {
  changePassword,
  login,
  logout,
  refreshToken
} from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

router.post('/login', asyncHandler(login));
router.post('/logout', authenticate, asyncHandler(logout));
router.post('/change-password', authenticate, asyncHandler(changePassword));
router.post('/refresh-token', asyncHandler(refreshToken));

export default router;
