"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification_1.Notification.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 50,
            include: [
                {
                    model: require('../models/Task').Task,
                    as: 'task',
                    attributes: ['id', 'title'],
                },
            ],
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await Notification_1.Notification.findOne({
            where: { id, user_id: userId },
        });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        await notification.update({ is_read: true });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markAsRead = markAsRead;
const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification_1.Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markAllRead = markAllRead;
