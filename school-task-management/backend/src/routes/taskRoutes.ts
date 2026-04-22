import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import {
  createTask,
  ensureTaskCreateDependencies,
  ensureTaskUpdateDependencies,
  getAllTasks,
  getMyTasks,
  getTaskById,
  getTasksByDept,
  updateTask
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';
import { TASK_PRIORITIES, TASK_STATUSES } from '../models';

const router = Router();

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

const departmentHeadRoles = [
  'PROPERTY',
  'FINANCE',
  'ADMIN',
  'PRINCIPAL',
  'ADMISSION',
  'HR',
  'PURCHASE',
  'IT',
  'TRANSPORT'
];

const queryValidators = [
  query('status')
    .optional()
    .isIn([...TASK_STATUSES])
    .withMessage('Status must be a valid task status'),
  query('priority')
    .optional()
    .isIn([...TASK_PRIORITIES])
    .withMessage('Priority must be a valid task priority'),
  query('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department id must be a positive integer'),
  query('from').optional().isISO8601().withMessage('From date must be a valid ISO date'),
  query('to').optional().isISO8601().withMessage('To date must be a valid ISO date')
];

const createTaskValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('assigned_to')
    .notEmpty()
    .withMessage('assigned_to is required')
    .isInt({ min: 1 })
    .withMessage('assigned_to must be a positive integer'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn([...TASK_PRIORITIES])
    .withMessage('Priority must be a valid task priority'),
  body('due_date')
    .notEmpty()
    .withMessage('due_date is required')
    .isISO8601()
    .withMessage('due_date must be a valid ISO date'),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid ISO date'),
  body('department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('department_id must be a positive integer'),
  body('description').optional({ nullable: true }).isString().withMessage('description must be a string')
];

const updateTaskValidators = [
  param('id').isInt({ min: 1 }).withMessage('Task id must be a positive integer'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('assigned_to').optional().isInt({ min: 1 }).withMessage('assigned_to must be a positive integer'),
  body('priority')
    .optional()
    .isIn([...TASK_PRIORITIES])
    .withMessage('Priority must be a valid task priority'),
  body('status')
    .optional()
    .isIn([...TASK_STATUSES])
    .withMessage('Status must be a valid task status'),
  body('due_date').optional().isISO8601().withMessage('due_date must be a valid ISO date'),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid ISO date'),
  body('department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('department_id must be a positive integer'),
  body('comment').optional({ nullable: true }).isString().withMessage('comment must be a string'),
  body('description').optional({ nullable: true }).isString().withMessage('description must be a string')
];

router.post(
  '/',
  authenticate,
  requireRole('CHAIRMAN'),
  upload.single('attachment'),
  createTaskValidators,
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    const dependencyError = await ensureTaskCreateDependencies(req, res);
    if (dependencyError) {
      return dependencyError;
    }
    return createTask(req, res);
  })
);

router.get(
  '/',
  authenticate,
  requireRole('CHAIRMAN', ...departmentHeadRoles),
  queryValidators,
  handleValidationErrors,
  asyncHandler(getAllTasks)
);

router.get(
  '/my-tasks',
  authenticate,
  queryValidators,
  handleValidationErrors,
  asyncHandler(getMyTasks)
);

router.get(
  '/dept/:deptId',
  authenticate,
  requireRole('CHAIRMAN'),
  param('deptId').isInt({ min: 1 }).withMessage('Department id must be a positive integer'),
  handleValidationErrors,
  asyncHandler(getTasksByDept)
);

router.get(
  '/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Task id must be a positive integer'),
  handleValidationErrors,
  asyncHandler(getTaskById)
);

router.put(
  '/:id',
  authenticate,
  requireRole('CHAIRMAN', ...departmentHeadRoles),
  upload.single('attachment'),
  updateTaskValidators,
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    const dependencyError = await ensureTaskUpdateDependencies(req, res);
    if (dependencyError) {
      return dependencyError;
    }
    return updateTask(req, res);
  })
);

export default router;
