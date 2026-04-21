import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Department, User, USER_ROLES, UserRole } from '../models';
import { errorResponse, successResponse } from '../utils/responseHelper';

const userPublicAttributes = [
  'id',
  'name',
  'email',
  'role',
  'department_id',
  'is_active',
  'last_login'
];

const departmentInclude = {
  model: Department,
  attributes: ['id', 'name', 'description']
};

const serializeUser = (user: User) => user.get({ plain: true });

const isChairmanAccount = (user: User) => user.role === 'CHAIRMAN';

export const getAllUsers = async (req: Request, res: Response) => {
  const { role, department_id } = req.query;
  const where: Record<string, unknown> = {};

  if (typeof role === 'string' && role) {
    where.role = role;
  }

  if (typeof department_id === 'string' && department_id) {
    where.department_id = Number(department_id);
  }

  const users = await User.findAll({
    where,
    attributes: userPublicAttributes,
    include: [departmentInclude],
    order: [['name', 'ASC']]
  });

  return successResponse(res, users.map(serializeUser), 'Users fetched successfully');
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id, {
    attributes: userPublicAttributes,
    include: [departmentInclude]
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, serializeUser(user), 'User fetched successfully');
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, department_id } = req.body as {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department_id?: number | null;
  };

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return errorResponse(
      res,
      'Validation failed',
      422,
      [{ field: 'email', message: 'Email is already in use' }]
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password_hash: passwordHash,
    role,
    department_id: department_id ?? null,
    is_active: true
  } as User);

  const createdUser = await User.findByPk(user.id, {
    attributes: userPublicAttributes,
    include: [departmentInclude]
  });

  return successResponse(res, createdUser ? serializeUser(createdUser) : null, 'User created successfully', 201);
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  if (isChairmanAccount(user)) {
    return errorResponse(res, 'Chairman account cannot be updated', 403);
  }

  const { name, email, role, department_id, is_active } = req.body as {
    name?: string;
    email?: string;
    role?: UserRole;
    department_id?: number | null;
    is_active?: boolean;
  };

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return errorResponse(
        res,
        'Validation failed',
        422,
        [{ field: 'email', message: 'Email is already in use' }]
      );
    }
  }

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.role = role ?? user.role;
  user.department_id = department_id !== undefined ? department_id : user.department_id;
  user.is_active = is_active !== undefined ? is_active : user.is_active;

  await user.save();

  const updatedUser = await User.findByPk(user.id, {
    attributes: userPublicAttributes,
    include: [departmentInclude]
  });

  return successResponse(res, updatedUser ? serializeUser(updatedUser) : null, 'User updated successfully');
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  if (isChairmanAccount(user)) {
    return errorResponse(res, 'Chairman account cannot be deactivated', 403);
  }

  user.is_active = false;
  await user.save();

  return successResponse(res, null, 'User deactivated successfully');
};

export const isValidRole = (role: string) => USER_ROLES.includes(role as UserRole);
