"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDelayedTasks = void 0;
const Task_1 = require("../models/Task");
const TaskHistory_1 = require("../models/TaskHistory");
const Notification_1 = require("../models/Notification");
const sockets_1 = require("../config/sockets");
const sequelize_1 = require("sequelize");
const checkDelayedTasks = async () => {
    const delayedTasks = await Task_1.Task.findAll({
        where: {
            status: {
                [sequelize_1.Op.notIn]: ['COMPLETED', 'ESCALATED'],
            },
            due_date: {
                [sequelize_1.Op.lt]: new Date(),
            },
        },
    });
    for (const task of delayedTasks) {
        // Update status to DELAYED
        await task.update({ status: 'DELAYED' });
        // Create task history
        await TaskHistory_1.TaskHistory.create({
            task_id: task.id,
            updated_by: 1, // System user, assuming ID 1 is system
            old_status: task.status,
            new_status: 'DELAYED',
            comment: 'Automatically marked as delayed due to overdue due date',
        });
        // Create notification
        await Notification_1.Notification.create({
            user_id: task.assigned_to,
            type: 'TASK_DELAYED',
            message: `Task "${task.title}" is now delayed`,
            task_id: task.id,
        });
        // Emit socket event
        (0, sockets_1.emitToUser)(task.assigned_to, 'notification:new', {
            id: task.id,
            type: 'TASK_DELAYED',
            message: `Task "${task.title}" is now delayed`,
            task_id: task.id,
        });
    }
    console.log(`Checked and updated ${delayedTasks.length} delayed tasks`);
};
exports.checkDelayedTasks = checkDelayedTasks;
