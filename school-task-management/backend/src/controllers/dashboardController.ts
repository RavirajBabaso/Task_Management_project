import { Op } from 'sequelize';
import { Request, Response } from 'express';
import {
  Announcement,
  Approval,
  Department,
  Notification,
  Task,
  User
} from '../models';
import { errorResponse, successResponse } from '../utils/responseHelper';

const getHealthColor = (completionPct: number) => {
  if (completionPct >= 75) {
    return 'green';
  }

  if (completionPct >= 50) {
    return 'amber';
  }

  return 'red';
};

const safePercentage = (completed: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  return Number(((completed / total) * 100).toFixed(2));
};

const getAuthenticatedUser = async (req: Request) => {
  if (!req.user) {
    return null;
  }

  return User.findByPk(req.user.id);
};

export const getChairmanDashboard = async (_req: Request, res: Response) => {
  const [tasks, pendingApprovals, recentTasks, activeAlerts, departments] = await Promise.all([
    Task.findAll({
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
    }),
    Approval.count({ where: { status: 'PENDING' } }),
    Task.findAll({
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] }
      ],
      order: [['due_date', 'ASC']],
      limit: 5
    }),
    Task.findAll({
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      where: {
        status: {
          [Op.in]: ['DELAYED', 'ESCALATED']
        }
      },
      order: [['due_date', 'ASC']],
      limit: 5
    }),
    Department.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    })
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
  const delayedTasks = tasks.filter((task) => task.status === 'DELAYED').length;
  const completionRate = safePercentage(completedTasks, totalTasks);

  const departmentHealth = departments.map((department) => {
    const departmentTasks = tasks.filter((task) => task.department_id === department.id);
    const totalDepartmentTasks = departmentTasks.length;
    const completedDepartmentTasks = departmentTasks.filter(
      (task) => task.status === 'COMPLETED'
    ).length;
    const completionPct = safePercentage(completedDepartmentTasks, totalDepartmentTasks);

    return {
      departmentId: department.id,
      name: department.name,
      totalTasks: totalDepartmentTasks,
      completed: completedDepartmentTasks,
      completionPct,
      healthColor: getHealthColor(completionPct)
    };
  });

  return successResponse(
    res,
    {
      totalTasks,
      completedTasks,
      completionRate,
      delayedTasks,
      pendingApprovals,
      departmentHealth,
      recentTasks,
      activeAlerts
    },
    'Chairman dashboard fetched successfully'
  );
};

export const getDeptDashboard = async (req: Request, res: Response) => {
  const departmentId = Number(req.params.deptId);
  const authenticatedUser = await getAuthenticatedUser(req);

  if (!authenticatedUser) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  if (
    authenticatedUser.role !== 'CHAIRMAN' &&
    authenticatedUser.department_id !== departmentId
  ) {
    return errorResponse(res, 'You do not have permission to access this department dashboard', 403);
  }

  const [department, myTasks, recentAnnouncements] = await Promise.all([
    Department.findByPk(departmentId),
    Task.findAll({
      where: { department_id: departmentId },
      include: [{ model: User, as: 'assignedTo', attributes: ['id', 'name', 'role'] }],
      order: [['due_date', 'ASC']]
    }),
    Announcement.findAll({
      where: {
        [Op.or]: [{ target: 'ALL' }, { target: 'DEPARTMENT', department_id: departmentId }]
      },
      order: [['created_at', 'DESC']],
      limit: 5
    })
  ]);

  if (!department) {
    return errorResponse(res, 'Department not found', 404);
  }

  const pendingCount = myTasks.filter((task) => task.status === 'PENDING').length;
  const inProgressCount = myTasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const completedCount = myTasks.filter((task) => task.status === 'COMPLETED').length;
  const delayedCount = myTasks.filter((task) => task.status === 'DELAYED').length;

  return successResponse(
    res,
    {
      myTasks,
      pendingCount,
      inProgressCount,
      completedCount,
      delayedCount,
      recentAnnouncements
    },
    'Department dashboard fetched successfully'
  );
};

export const getStaffPerformance = async (_req: Request, res: Response) => {
  const users = await User.findAll({
    where: {
      is_active: true
    },
    attributes: ['id', 'name', 'role']
  });

  const tasks = await Task.findAll();

  const performance = users.map((user) => {
    const userTasks = tasks.filter((task) => task.assigned_to === user.id);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((task) => task.status === 'COMPLETED').length;
    const delayedTasks = userTasks.filter((task) => task.status === 'DELAYED').length;
    const performanceScore = safePercentage(completedTasks, totalTasks);
    const delayRate = safePercentage(delayedTasks, totalTasks);

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      totalTasks,
      completedTasks,
      delayedTasks,
      performanceScore,
      delayRate
    };
  });

  return successResponse(res, performance, 'Staff performance fetched successfully');
};

export const getMonthlyComparison = async (_req: Request, res: Response) => {
  const departments = await Department.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  });

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
      key: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
      label: monthStart.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
      }),
      start: monthStart,
      end: monthEnd
    };
  });

  const tasks = await Task.findAll({
    where: {
      due_date: {
        [Op.gte]: months[0].start,
        [Op.lte]: months[months.length - 1].end
      }
    }
  });

  const comparison = departments.map((department) => ({
    departmentId: department.id,
    name: department.name,
    monthlyRates: months.map((month) => {
      const monthTasks = tasks.filter(
        (task) =>
          task.department_id === department.id &&
          new Date(task.due_date) >= month.start &&
          new Date(task.due_date) <= month.end
      );
      const completed = monthTasks.filter((task) => task.status === 'COMPLETED').length;

      return {
        month: month.label,
        completionRate: safePercentage(completed, monthTasks.length),
        totalTasks: monthTasks.length,
        completedTasks: completed
      };
    })
  }));

  return successResponse(res, comparison, 'Monthly comparison fetched successfully');
};
