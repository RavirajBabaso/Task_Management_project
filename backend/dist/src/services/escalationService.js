"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escalateDelayedTasks = void 0;
const Task_1 = require("../models/Task");
const TaskHistory_1 = require("../models/TaskHistory");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const sockets_1 = require("../config/sockets");
const sequelize_1 = require("sequelize");
const escalateDelayedTasks = async () => {
    // Find tasks that are DELAYED and have been delayed for more than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const delayedTasks = await Task_1.Task.findAll({
        where: {
            status: 'DELAYED',
        },
        include: [
            {
                model: TaskHistory_1.TaskHistory,
                as: 'histories',
                where: {
                    new_status: 'DELAYED',
                    updated_at: {
                        [sequelize_1.Op.lt]: twentyFourHoursAgo,
                    },
                },
                required: true,
            },
        ],
    });
    // Find Chairman
    const chairman = await User_1.User.findOne({
        where: { role: 'CHAIRMAN' },
    });
    if (!chairman) {
        console.log('No Chairman found for escalation');
        return;
    }
    for (const task of delayedTasks) {
        // Update status to ESCALATED
        await task.update({ status: 'ESCALATED' });
        // Create task history
        await TaskHistory_1.TaskHistory.create({
            task_id: task.id,
            updated_by: 1, // System user
            old_status: 'DELAYED',
            new_status: 'ESCALATED',
            comment: 'Automatically escalated due to prolonged delay',
        });
        // Create notification for Chairman
        await Notification_1.Notification.create({
            user_id: chairman.id,
            type: 'TASK_ESCALATED',
            message: `Task "${task.title}" has been escalated`,
            task_id: task.id,
        });
        // Emit socket event to Chairman
        (0, sockets_1.emitToUser)(chairman.id, 'task:escalated', {
            taskId: task.id,
            title: task.title,
            assignedTo: task.assigned_to,
        });
    }
    console.log(`Escalated ${delayedTasks.length} tasks`);
};
exports.escalateDelayedTasks = escalateDelayedTasks;
