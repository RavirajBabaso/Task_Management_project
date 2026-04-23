"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.createTask = void 0;
const Task_1 = require("../models/Task");
const TaskHistory_1 = require("../models/TaskHistory");
const Notification_1 = require("../models/Notification");
const sockets_1 = require("../config/sockets");
const createTask = async (taskData, assignedBy) => {
    const task = await Task_1.Task.create({
        ...taskData,
        assigned_by: assignedBy,
        status: 'PENDING',
    });
    // Create notification for assignee
    await Notification_1.Notification.create({
        user_id: task.assigned_to,
        type: 'TASK_ASSIGNED',
        message: `New task assigned: ${task.title}`,
        task_id: task.id,
    });
    // Emit socket event
    (0, sockets_1.emitToUser)(task.assigned_to, 'notification:new', {
        id: task.id,
        type: 'TASK_ASSIGNED',
        message: `New task assigned: ${task.title}`,
        task_id: task.id,
    });
    return task;
};
exports.createTask = createTask;
const updateTaskStatus = async (taskId, newStatus, updatedBy, comment) => {
    const task = await Task_1.Task.findByPk(taskId);
    if (!task)
        throw new Error('Task not found');
    const oldStatus = task.status;
    await task.update({ status: newStatus });
    // Create task history
    await TaskHistory_1.TaskHistory.create({
        task_id: taskId,
        updated_by: updatedBy,
        old_status: oldStatus,
        new_status: newStatus,
        comment,
    });
    // Create notification for assignee
    await Notification_1.Notification.create({
        user_id: task.assigned_to,
        type: 'TASK_UPDATED',
        message: `Task "${task.title}" status updated to ${newStatus}`,
        task_id: task.id,
    });
    // Emit socket event
    (0, sockets_1.emitToUser)(task.assigned_to, 'notification:new', {
        id: task.id,
        type: 'TASK_UPDATED',
        message: `Task "${task.title}" status updated to ${newStatus}`,
        task_id: task.id,
    });
    return task;
};
exports.updateTaskStatus = updateTaskStatus;
