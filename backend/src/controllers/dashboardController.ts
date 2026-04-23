import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { Department, Task, User } from '../models';
import { errorResponse, successResponse } from '../utils/responseHelper';

const roundOneDecimal = (value: number) => Number(value.toFixed(1));

const safePercent = (numerator: number, denominator: number) => {
  if (denominator === 0) {
    return 0;
  }

  return roundOneDecimal((numerator / denominator) * 100);
};

const buildMonths = (count: number) => {
  const now = new Date();
  const months = [] as {
    label: string;
    start: Date;
    end: Date;
  }[];

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const month = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;

    months.push({
      label: month,
      start,
      end
    });
  }

  return months;
};

export const getPerformanceAnalytics = async (_req: Request, res: Response) => {
  try {
    const [users, tasks] = await Promise.all([
      User.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'role']
      }),
      Task.findAll({
        include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name'] }]
      })
    ]);

    const performance = users.map((user) => {
      const assignedTasks = tasks.filter((task) => task.assigned_to === user.id);
      const totalAssigned = assignedTasks.length;
      const completed = assignedTasks.filter((task) => task.status === 'COMPLETED').length;
      const delayed = assignedTasks.filter((task) => task.status === 'DELAYED').length;
      const performanceScore = safePercent(completed, totalAssigned);
      const delayRate = safePercent(delayed, totalAssigned);

      return {
        userId: user.id,
        name: user.name,
        role: user.role,
        totalAssigned,
        completed,
        delayed,
        performanceScore,
        delayRate
      };
    });

    const sortedPerformance = performance.sort(
      (a, b) => b.performanceScore - a.performanceScore
    );

    const allScores = sortedPerformance.map((entry) => entry.performanceScore);
    const schoolAveragePerformance = allScores.length
      ? roundOneDecimal(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
      : 0;

    const topPerformer = sortedPerformance.length ? sortedPerformance[0] : null;
    const needsAttention = sortedPerformance.length
      ? sortedPerformance[sortedPerformance.length - 1]
      : null;

    return successResponse(res, {
      performance: sortedPerformance,
      schoolAveragePerformance,
      topPerformer,
      needsAttention
    });
  } catch (error) {
    return errorResponse(res, 'Unable to fetch performance analytics', 500, error);
  }
};

export const getMonthlyComparison = async (_req: Request, res: Response) => {
  try {
    const months = buildMonths(6);
    const tasks = await Task.findAll({
      where: {
        start_date: {
          [Op.gte]: months[0].start,
          [Op.lte]: months[months.length - 1].end
        }
      }
    });

    const comparison = months.map((month) => {
      const monthTasks = tasks.filter((task) => {
        const taskDate = new Date(task.start_date as Date);
        return taskDate >= month.start && taskDate <= month.end;
      });

      const completedTasks = monthTasks.filter((task) => task.status === 'COMPLETED').length;
      const totalTasks = monthTasks.length;
      const completionRate = safePercent(completedTasks, totalTasks);

      return {
        month: month.label,
        completionRate,
        totalTasks,
        completedTasks
      };
    });

    return successResponse(res, comparison);
  } catch (error) {
    return errorResponse(res, 'Unable to fetch monthly comparison analytics', 500, error);
  }
};

export const getDepartmentAnalytics = async (_req: Request, res: Response) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const tasks = await Task.findAll({
      where: {
        start_date: {
          [Op.gte]: previousMonthStart,
          [Op.lte]: currentMonthEnd
        }
      }
    });

    const departmentAnalytics = departments.map((department) => {
      const currentTasks = tasks.filter((task) => {
        const taskDate = new Date(task.start_date as Date);
        return (
          task.department_id === department.id &&
          taskDate >= currentMonthStart &&
          taskDate <= currentMonthEnd
        );
      });

      const previousTasks = tasks.filter((task) => {
        const taskDate = new Date(task.start_date as Date);
        return (
          task.department_id === department.id &&
          taskDate >= previousMonthStart &&
          taskDate <= previousMonthEnd
        );
      });

      const currentCompleted = currentTasks.filter((task) => task.status === 'COMPLETED').length;
      const previousCompleted = previousTasks.filter((task) => task.status === 'COMPLETED').length;
      const currentRate = safePercent(currentCompleted, currentTasks.length);
      const previousRate = safePercent(previousCompleted, previousTasks.length);
      const completionRateDelta = roundOneDecimal(currentRate - previousRate);

      return {
        departmentId: department.id,
        name: department.name,
        currentMonth: {
          completionRate: currentRate,
          totalTasks: currentTasks.length,
          completedTasks: currentCompleted
        },
        previousMonth: {
          completionRate: previousRate,
          totalTasks: previousTasks.length,
          completedTasks: previousCompleted
        },
        completionRateDelta
      };
    });

    return successResponse(res, departmentAnalytics);
  } catch (error) {
    return errorResponse(res, 'Unable to fetch department analytics', 500, error);
  }
};
