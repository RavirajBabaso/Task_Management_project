import { Task } from '../models/Task';
import { TaskHistory } from '../models/TaskHistory';
import { Notification } from '../models/Notification';
import { emitToUser } from '../config/socket';

export const createTask = async (taskData: any, assignedBy: number) => {
  const task = await Task.create({
    ...taskData,
    assigned_by: assignedBy,
    status: 'PENDING',
  });

  // Create notification for assignee
  await Notification.create({
    user_id: task.assigned_to,
    type: 'TASK_ASSIGNED',
    message: `New task assigned: ${task.title}`,
    task_id: task.id,
  });

  // Emit socket event
  emitToUser(task.assigned_to, 'notification:new', {
    id: task.id,
    type: 'TASK_ASSIGNED',
    message: `New task assigned: ${task.title}`,
    task_id: task.id,
  });

  return task;
};

export const updateTaskStatus = async (taskId: number, newStatus: string, updatedBy: number, comment?: string) => {
  const task = await Task.findByPk(taskId);
  if (!task) throw new Error('Task not found');

  const oldStatus = task.status;

  await task.update({ status: newStatus });

  // Create task history
  await TaskHistory.create({
    task_id: taskId,
    updated_by: updatedBy,
    old_status: oldStatus,
    new_status: newStatus,
    comment,
  });

  // Create notification for assignee
  await Notification.create({
    user_id: task.assigned_to,
    type: 'TASK_UPDATED',
    message: `Task "${task.title}" status updated to ${newStatus}`,
    task_id: task.id,
  });

  // Emit socket event
  emitToUser(task.assigned_to, 'notification:new', {
    id: task.id,
    type: 'TASK_UPDATED',
    message: `Task "${task.title}" status updated to ${newStatus}`,
    task_id: task.id,
  });

  return task;
};