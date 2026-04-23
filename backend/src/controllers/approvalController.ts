import { Request, Response } from 'express';
import { Approval } from '../models/Approval';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { emitToUser } from '../config/sockets';
import { successResponse, errorResponse } from '../utils/responseHelper';

export const createApproval = async (req: Request, res: Response) => {
  try {
    const { type, title, details, amount } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!type || !title) {
      return errorResponse(res, 'Type and title are required', 400);
    }

    // Validate type
    const validTypes = ['BUDGET', 'PURCHASE', 'POLICY', 'EVENT'];
    if (!validTypes.includes(type)) {
      return errorResponse(res, 'Invalid approval type', 400);
    }

    // Create approval
    const approval = await Approval.create({
      type,
      title,
      details,
      amount,
      requested_by: userId,
      status: 'PENDING'
    } as Approval);

    // Find Chairman to notify
    const chairman = await User.findOne({
      where: { role: 'CHAIRMAN' }
    });

    if (chairman) {
      // Create notification for Chairman
      await Notification.create({
        user_id: chairman.id,
        type: 'ANNOUNCEMENT', // Using existing notification type
        message: `New ${type.toLowerCase()} approval request: ${title}`,
        task_id: null
      } as Notification);

      // Emit socket event to Chairman
      emitToUser(chairman.id, 'approval:new', {
        id: approval.id,
        type: approval.type,
        title: approval.title,
        requested_by: userId,
        created_at: approval.created_at
      });
    }

    successResponse(res, approval, 'Approval request submitted successfully', 201);
  } catch (error) {
    console.error('Error creating approval:', error);
    errorResponse(res, 'Failed to create approval request');
  }
};

export const getAllApprovals = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      where.status = status;
    }

    const approvals = await Approval.findAll({
      where,
      include: [
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    successResponse(res, approvals, 'Approvals retrieved successfully');
  } catch (error) {
    console.error('Error fetching approvals:', error);
    errorResponse(res, 'Failed to fetch approvals');
  }
};

export const getMyApprovals = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const approvals = await Approval.findAll({
      where: { requested_by: userId },
      include: [
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'name', 'email', 'role'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    successResponse(res, approvals, 'Your approvals retrieved successfully');
  } catch (error) {
    console.error('Error fetching user approvals:', error);
    errorResponse(res, 'Failed to fetch your approvals');
  }
};

export const processApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const chairmanId = req.user!.id;

    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse(res, 'Status must be APPROVED or REJECTED', 400);
    }

    // Find approval
    const approval = await Approval.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!approval) {
      return errorResponse(res, 'Approval not found', 404);
    }

    if (approval.status !== 'PENDING') {
      return errorResponse(res, 'Approval has already been processed', 400);
    }

    // Update approval
    await approval.update({
      status,
      approved_by: chairmanId
    });

    // Create notification for requester
    const decision = status === 'APPROVED' ? 'approved' : 'rejected';
    await Notification.create({
      user_id: approval.requested_by,
      type: 'ANNOUNCEMENT', // Using existing notification type
      message: `Your ${approval.type.toLowerCase()} approval request "${approval.title}" has been ${decision}`,
      task_id: null
    } as Notification);

    // Emit socket event to requester
    emitToUser(approval.requested_by, 'approval:updated', {
      id: approval.id,
      status: approval.status,
      approved_by: chairmanId,
      updated_at: new Date()
    });

    successResponse(res, approval, `Approval ${decision} successfully`);
  } catch (error) {
    console.error('Error processing approval:', error);
    errorResponse(res, 'Failed to process approval');
  }
};