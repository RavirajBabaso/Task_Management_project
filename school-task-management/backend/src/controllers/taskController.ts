import { Request, Response } from 'express';
import { Department, TASK_PRIORITIES, TASK_STATUSES, Task, User } from '../models';
import * as taskService from '../services/taskService';
import { errorResponse, successResponse } from '../utils/responseHelper';

const DEPARTMENT_HEAD_ROLES = [
  'PROPERTY',
  'FINANCE',
  'ADMIN',
  'PRINCIPAL',
  'ADMISSION',
  'HR',
  'PURCHASE',
  'IT',
  'TRANSPORT'
] as const;

const isDepartmentHead = (role?: string) =>
  typeof role === 'string' && DEPARTMENT_HEAD_ROLES.includes(role as (typeof DEPARTMENT_HEAD_ROLES)[number]);

const buildAttachmentPath = (file?: Express.Multer.File) => {
  if (!file) {
    return undefined;
  }

  return `uploads/${file.filename}`;
};

const getTaskFiltersFromQuery = (req: Request) => {
  const filters: Parameters<typeof taskService.getTasksWithFilters>[0] = {};

  if (typeof req.query.status === 'string' && req.query.status) {
    filters.status = req.query.status as (typeof TASK_STATUSES)[number];
  }

  if (typeof req.query.priority === 'string' && req.query.priority) {
    filters.priority = req.query.priority as (typeof TASK_PRIORITIES)[number];
  }

  if (typeof req.query.department_id === 'string' && req.query.department_id) {
    filters.department_id = Number(req.query.department_id);
  }

  if (typeof req.query.from === 'string' && req.query.from) {
    filters.from = req.query.from;
  }

  if (typeof req.query.to === 'string' && req.query.to) {
    filters.to = req.query.to;
  }

  return filters;
};

export const createTask = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  const { title, description, assigned_to, department_id, priority, due_date, start_date } = req.body as {
    assigned_to: number;
    department_id?: number | null;
    description?: string;
    due_date: string;
    priority: (typeof TASK_PRIORITIES)[number];
    start_date?: string;
    title: string;
  };

  const task = await taskService.createTask(
    {
      title,
      description,
      assigned_to: Number(assigned_to),
      department_id: department_id !== undefined && department_id !== null ? Number(department_id) : null,
      priority,
      due_date,
      start_date,
      attachment_path: buildAttachmentPath(req.file)
    },
    req.user.id
  );

  return successResponse(res, task, 'Task created successfully', 201);
};

export const getAllTasks = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  const filters = getTaskFiltersFromQuery(req);
  taskService.validateTaskFilters(filters);

  if (isDepartmentHead(req.user.role)) {
    filters.assigned_to = req.user.id;
  }

  const tasks = await taskService.getTasksWithFilters(filters);
  return successResponse(res, tasks, 'Tasks fetched successfully');
};

export const getMyTasks = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  const filters = getTaskFiltersFromQuery(req);
  taskService.validateTaskFilters(filters);
  filters.assigned_to = req.user.id;

  const tasks = await taskService.getTasksWithFilters(filters);
  return successResponse(res, tasks, 'My tasks fetched successfully');
};

export const getTasksByDept = async (req: Request, res: Response) => {
  const departmentId = Number(req.params.deptId);
  const tasks = await taskService.getTasksWithFilters({ department_id: departmentId });
  return successResponse(res, tasks, 'Department tasks fetched successfully');
};

export const getTaskById = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  const task = await taskService.getTaskById(Number(req.params.id));

  if (!task) {
    return errorResponse(res, 'Task not found', 404);
  }

  if (isDepartmentHead(req.user.role) && task.assigned_to !== req.user.id) {
    return errorResponse(res, 'You do not have permission to access this task', 403);
  }

  return successResponse(res, task, 'Task fetched successfully');
};

export const updateTask = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  const taskId = Number(req.params.id);
  const existingTask = await Task.findByPk(taskId);

  if (!existingTask) {
    return errorResponse(res, 'Task not found', 404);
  }

  const isChairman = req.user.role === 'CHAIRMAN';

  if (!isChairman && (!isDepartmentHead(req.user.role) || existingTask.assigned_to !== req.user.id)) {
    return errorResponse(res, 'You do not have permission to update this task', 403);
  }

  const payload = req.body as {
    assigned_to?: number;
    comment?: string;
    department_id?: number | null;
    description?: string | null;
    due_date?: string;
    priority?: (typeof TASK_PRIORITIES)[number];
    start_date?: string;
    status?: (typeof TASK_STATUSES)[number];
    title?: string;
  };

  if (payload.status && !TASK_STATUSES.includes(payload.status)) {
    return errorResponse(res, 'Invalid task status', 400);
  }

  if (payload.priority && !TASK_PRIORITIES.includes(payload.priority)) {
    return errorResponse(res, 'Invalid task priority', 400);
  }

  const updates = isChairman
    ? {
        title: payload.title,
        description: payload.description,
        assigned_to: payload.assigned_to !== undefined ? Number(payload.assigned_to) : undefined,
        department_id:
          payload.department_id !== undefined
            ? payload.department_id === null
              ? null
              : Number(payload.department_id)
            : undefined,
        priority: payload.priority,
        start_date: payload.start_date,
        due_date: payload.due_date,
        status: payload.status,
        comment: payload.comment,
        attachment_path: buildAttachmentPath(req.file)
      }
    : {
        status: payload.status,
        comment: payload.comment,
        attachment_path: buildAttachmentPath(req.file)
      };

  const task = await taskService.updateTask(taskId, updates, req.user.id);

  return successResponse(res, task, 'Task updated successfully');
};

export const ensureTaskCreateDependencies = async (req: Request, res: Response) => {
  const { assigned_to, department_id } = req.body as { assigned_to?: number; department_id?: number | null };

  const assignee = assigned_to ? await User.findByPk(Number(assigned_to)) : null;

  if (!assignee || !assignee.is_active) {
    return errorResponse(
      res,
      'Validation failed',
      422,
      [{ field: 'assigned_to', message: 'Assigned user does not exist or is inactive' }]
    );
  }

  if (department_id !== undefined && department_id !== null) {
    const department = await Department.findByPk(Number(department_id));

    if (!department) {
      return errorResponse(
        res,
        'Validation failed',
        422,
        [{ field: 'department_id', message: 'Department does not exist' }]
      );
    }
  }

  return null;
};

export const ensureTaskUpdateDependencies = async (req: Request, res: Response) => {
  const { assigned_to, department_id } = req.body as { assigned_to?: number; department_id?: number | null };

  if (assigned_to !== undefined) {
    const assignee = await User.findByPk(Number(assigned_to));

    if (!assignee || !assignee.is_active) {
      return errorResponse(
        res,
        'Validation failed',
        422,
        [{ field: 'assigned_to', message: 'Assigned user does not exist or is inactive' }]
      );
    }
  }

  if (department_id !== undefined && department_id !== null) {
    const department = await Department.findByPk(Number(department_id));

    if (!department) {
      return errorResponse(
        res,
        'Validation failed',
        422,
        [{ field: 'department_id', message: 'Department does not exist' }]
      );
    }
  }

  return null;
};
