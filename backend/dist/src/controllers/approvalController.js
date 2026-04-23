"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processApproval = exports.getMyApprovals = exports.getAllApprovals = exports.createApproval = void 0;
const Approval_1 = require("../models/Approval");
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
const sockets_1 = require("../config/sockets");
const responseHelper_1 = require("../utils/responseHelper");
const createApproval = async (req, res) => {
    try {
        const { type, title, details, amount } = req.body;
        const userId = req.user.id;
        // Validate required fields
        if (!type || !title) {
            return (0, responseHelper_1.errorResponse)(res, 'Type and title are required', 400);
        }
        // Validate type
        const validTypes = ['BUDGET', 'PURCHASE', 'POLICY', 'EVENT'];
        if (!validTypes.includes(type)) {
            return (0, responseHelper_1.errorResponse)(res, 'Invalid approval type', 400);
        }
        // Create approval
        const approval = await Approval_1.Approval.create({
            type,
            title,
            details,
            amount,
            requested_by: userId,
            status: 'PENDING'
        });
        // Find Chairman to notify
        const chairman = await User_1.User.findOne({
            where: { role: 'CHAIRMAN' }
        });
        if (chairman) {
            // Create notification for Chairman
            await Notification_1.Notification.create({
                user_id: chairman.id,
                type: 'ANNOUNCEMENT', // Using existing notification type
                message: `New ${type.toLowerCase()} approval request: ${title}`,
                task_id: null
            });
            // Emit socket event to Chairman
            (0, sockets_1.emitToUser)(chairman.id, 'approval:new', {
                id: approval.id,
                type: approval.type,
                title: approval.title,
                requested_by: userId,
                created_at: approval.created_at
            });
        }
        (0, responseHelper_1.successResponse)(res, approval, 'Approval request submitted successfully', 201);
    }
    catch (error) {
        console.error('Error creating approval:', error);
        (0, responseHelper_1.errorResponse)(res, 'Failed to create approval request');
    }
};
exports.createApproval = createApproval;
const getAllApprovals = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            where.status = status;
        }
        const approvals = await Approval_1.Approval.findAll({
            where,
            include: [
                {
                    model: User_1.User,
                    as: 'requestedBy',
                    attributes: ['id', 'name', 'email', 'role']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        (0, responseHelper_1.successResponse)(res, approvals, 'Approvals retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching approvals:', error);
        (0, responseHelper_1.errorResponse)(res, 'Failed to fetch approvals');
    }
};
exports.getAllApprovals = getAllApprovals;
const getMyApprovals = async (req, res) => {
    try {
        const userId = req.user.id;
        const approvals = await Approval_1.Approval.findAll({
            where: { requested_by: userId },
            include: [
                {
                    model: User_1.User,
                    as: 'approvedBy',
                    attributes: ['id', 'name', 'email', 'role'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });
        (0, responseHelper_1.successResponse)(res, approvals, 'Your approvals retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching user approvals:', error);
        (0, responseHelper_1.errorResponse)(res, 'Failed to fetch your approvals');
    }
};
exports.getMyApprovals = getMyApprovals;
const processApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const chairmanId = req.user.id;
        // Validate status
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return (0, responseHelper_1.errorResponse)(res, 'Status must be APPROVED or REJECTED', 400);
        }
        // Find approval
        const approval = await Approval_1.Approval.findByPk(id, {
            include: [
                {
                    model: User_1.User,
                    as: 'requestedBy',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        if (!approval) {
            return (0, responseHelper_1.errorResponse)(res, 'Approval not found', 404);
        }
        if (approval.status !== 'PENDING') {
            return (0, responseHelper_1.errorResponse)(res, 'Approval has already been processed', 400);
        }
        // Update approval
        await approval.update({
            status,
            approved_by: chairmanId
        });
        // Create notification for requester
        const decision = status === 'APPROVED' ? 'approved' : 'rejected';
        await Notification_1.Notification.create({
            user_id: approval.requested_by,
            type: 'ANNOUNCEMENT', // Using existing notification type
            message: `Your ${approval.type.toLowerCase()} approval request "${approval.title}" has been ${decision}`,
            task_id: null
        });
        // Emit socket event to requester
        (0, sockets_1.emitToUser)(approval.requested_by, 'approval:updated', {
            id: approval.id,
            status: approval.status,
            approved_by: chairmanId,
            updated_at: new Date()
        });
        (0, responseHelper_1.successResponse)(res, approval, `Approval ${decision} successfully`);
    }
    catch (error) {
        console.error('Error processing approval:', error);
        (0, responseHelper_1.errorResponse)(res, 'Failed to process approval');
    }
};
exports.processApproval = processApproval;
