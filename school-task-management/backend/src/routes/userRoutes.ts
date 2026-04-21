import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  isValidRole,
  updateUser
} from '../controllers/userController';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';
import { Department } from '../models';

const router = Router();
const chairmanOnly = [authenticate, requireRole('CHAIRMAN')];

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('User id must be a positive integer')
];

const departmentValidator = body('department_id')
  .optional({ nullable: true })
  .isInt({ min: 1 })
  .withMessage('Department id must be a positive integer')
  .bail()
  .custom(async (departmentId) => {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw new Error('Department does not exist');
    }
    return true;
  });

const createUserValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 150 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').custom((role) => {
    if (!isValidRole(role)) {
      throw new Error('Role must be a valid role');
    }
    return true;
  }),
  departmentValidator
];

const updateUserValidators = [
  ...idParamValidator,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ min: 2, max: 150 }),
  body('email').optional().trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('role')
    .optional()
    .custom((role) => {
      if (!isValidRole(role)) {
        throw new Error('Role must be a valid role');
      }
      return true;
    }),
  departmentValidator,
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean').toBoolean()
];

router.get(
  '/',
  ...chairmanOnly,
  query('role').optional().custom((role) => {
    if (!isValidRole(role)) {
      throw new Error('Role must be a valid role');
    }
    return true;
  }),
  query('department_id').optional().isInt({ min: 1 }).withMessage('Department id must be a positive integer'),
  handleValidationErrors,
  asyncHandler(getAllUsers)
);

router.post(
  '/',
  ...chairmanOnly,
  createUserValidators,
  handleValidationErrors,
  asyncHandler(createUser)
);

router.put(
  '/:id',
  ...chairmanOnly,
  updateUserValidators,
  handleValidationErrors,
  asyncHandler(updateUser)
);

router.delete(
  '/:id',
  ...chairmanOnly,
  idParamValidator,
  handleValidationErrors,
  asyncHandler(deleteUser)
);

router.get(
  '/:id',
  authenticate,
  idParamValidator,
  handleValidationErrors,
  asyncHandler(getUserById)
);

export default router;
