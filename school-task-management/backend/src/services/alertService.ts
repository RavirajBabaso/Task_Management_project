import { Task } from '../models/Task';
import { TaskHistory } from '../models/TaskHistory';
import { Notification } from '../models/Notification';
import { emitToUser } from '../config/socket';
import { Op } from 'sequelize';

export const checkDelayedTasks = async () => {
  const delayedTasks = await Task.findAll({
    where: {
      status: {
        [Op.notIn]: ['COMPLETED', 'ESCALATED'],
      },
      due_date: {
        [Op.lt]: new Date(),
      },
    },
  });

  for (const task of delayedTasks) {
    // Update status to DELAYED
    await task.update({ status: 'DELAYED' });

    // Create task history
    await TaskHistory.create({
      task_id: task.id,
      updated_by: 1, // System user, assuming ID 1 is system
      old_status: task.status,
      new_status: 'DELAYED',
      comment: 'Automatically marked as delayed due to overdue due date',
    } as any);

    // Create notification
    await Notification.create({
      user_id: task.assigned_to,
      type: 'TASK_DELAYED',
      message: `Task "${task.title}" is now delayed`,
      task_id: task.id,
    } as any);

    // Emit socket event
    emitToUser(task.assigned_to, 'notification:new', {
      id: task.id,
      type: 'TASK_DELAYED',
      message: `Task "${task.title}" is now delayed`,
      task_id: task.id,
    });
  }

  console.log(`Checked and updated ${delayedTasks.length} delayed tasks`);
};