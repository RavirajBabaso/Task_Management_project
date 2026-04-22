import { Task } from '../models/Task';
import { TaskHistory } from '../models/TaskHistory';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { emitToUser } from '../config/socket';
import { Op, Sequelize } from 'sequelize';

export const escalateDelayedTasks = async () => {
  // Find tasks that are DELAYED and have been delayed for more than 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const delayedTasks = await Task.findAll({
    where: {
      status: 'DELAYED',
    },
    include: [
      {
        model: TaskHistory,
        as: 'histories',
        where: {
          new_status: 'DELAYED',
          updated_at: {
            [Op.lt]: twentyFourHoursAgo,
          },
        },
        required: true,
      },
    ],
  });

  // Find Chairman
  const chairman = await User.findOne({
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
    await TaskHistory.create({
      task_id: task.id,
      updated_by: 1, // System user
      old_status: 'DELAYED',
      new_status: 'ESCALATED',
      comment: 'Automatically escalated due to prolonged delay',
    } as any);

    // Create notification for Chairman
    await Notification.create({
      user_id: chairman.id,
      type: 'TASK_ESCALATED',
      message: `Task "${task.title}" has been escalated`,
      task_id: task.id,
    } as any);

    // Emit socket event to Chairman
    emitToUser(chairman.id, 'task:escalated', {
      taskId: task.id,
      title: task.title,
      assignedTo: task.assigned_to,
    });
  }

  console.log(`Escalated ${delayedTasks.length} tasks`);
};