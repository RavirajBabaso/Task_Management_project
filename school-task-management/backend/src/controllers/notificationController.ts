import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { successResponse, errorResponse } from '../utils/responseHelper';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    successResponse(res, notifications, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await Notification.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    await notification.update({ is_read: true });

    successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};