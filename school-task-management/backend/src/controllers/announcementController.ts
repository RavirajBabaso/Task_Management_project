import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { emitToAll, emitToUser } from '../config/socket';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { Op } from 'sequelize';

interface CreateAnnouncementRequest extends Request {
  body: {
    message: string;
    target: 'ALL' | 'DEPARTMENT';
    department_id?: number;
  };
}

export const createAnnouncement = async (
  req: CreateAnnouncementRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, target, department_id } = req.body;
    const createdBy = req.user!.id;

    // Validate message length
    if (!message || message.trim().length < 10) {
      return errorResponse(res, 'Message must be at least 10 characters long', 400);
    }

    // Validate target
    if (!['ALL', 'DEPARTMENT'].includes(target)) {
      return errorResponse(res, 'Target must be either ALL or DEPARTMENT', 400);
    }

    // Validate department_id if target is DEPARTMENT
    if (target === 'DEPARTMENT') {
      if (!department_id) {
        return errorResponse(res, 'department_id is required when target is DEPARTMENT', 400);
      }
    }

    // Create announcement
    const announcement = await Announcement.create({
      created_by: createdBy,
      target,
      message: message.trim(),
      department_id: target === 'DEPARTMENT' ? department_id : null,
    } as Announcement);

    // Create notifications based on target
    let usersToNotify: User[];

    if (target === 'ALL') {
      // Get all active users
      usersToNotify = await User.findAll({
        where: { is_active: true },
      });

      // Emit to all connected sockets
      emitToAll('announcement:new', {
        id: announcement.id,
        message: announcement.message,
        created_by: createdBy,
        created_at: announcement.created_at,
        target: 'ALL',
      });
    } else {
      // Get users from specific department
      usersToNotify = await User.findAll({
        where: {
          department_id,
          is_active: true,
        },
      });

      // Emit to department users
      for (const user of usersToNotify) {
        emitToUser(user.id, 'announcement:new', {
          id: announcement.id,
          message: announcement.message,
          created_by: createdBy,
          created_at: announcement.created_at,
          target: 'DEPARTMENT',
          department_id,
        });
      }
    }

    // Create notification records
    const notifications = usersToNotify.map(user => ({
      user_id: user.id,
      type: 'ANNOUNCEMENT' as const,
      message: `New announcement: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      task_id: null,
      is_read: false,
    }));

    await Notification.bulkCreate(notifications as any);

    successResponse(res, announcement, 'Announcement created successfully');
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get announcements relevant to user
    const whereCondition: any = {
      [Op.or]: [
        { target: 'ALL' },
        {
          target: 'DEPARTMENT',
          department_id: user.department_id,
        },
      ],
    };

    const announcements = await Announcement.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    successResponse(res, announcements, 'Announcements retrieved successfully');
  } catch (error) {
    next(error);
  }
};