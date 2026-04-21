import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import redisClient from '../config/redis';
import { User } from '../models';
import { errorResponse, successResponse } from '../utils/responseHelper';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwtUtils';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const toAuthUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  department_id: user.department_id
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  const user = await User.findOne({ where: { email } });

  if (!user || !user.is_active) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  user.last_login = new Date();
  await user.save();
  await redisClient.set(`refresh:${user.id}`, refreshToken, 'EX', REFRESH_TOKEN_TTL_SECONDS);

  return successResponse(
    res,
    {
      user: toAuthUser(user),
      accessToken,
      refreshToken
    },
    'Login successful'
  );
};

export const logout = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  await redisClient.del(`refresh:${req.user.id}`);

  return successResponse(res, null, 'Logout successful');
};

export const changePassword = async (req: Request, res: Response) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication is required', 401);
  }

  const { oldPassword, currentPassword, newPassword } = req.body as {
    oldPassword?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  const passwordToVerify = oldPassword ?? currentPassword;

  if (!passwordToVerify || !newPassword) {
    return errorResponse(res, 'Old password and new password are required', 400);
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  const passwordMatches = await bcrypt.compare(passwordToVerify, user.password_hash);

  if (!passwordMatches) {
    return errorResponse(res, 'Old password is incorrect', 400);
  }

  user.password_hash = await bcrypt.hash(newPassword, 12);
  await user.save();

  return successResponse(res, null, 'Password changed successfully');
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body as { refreshToken?: string };

  if (!token) {
    return errorResponse(res, 'Refresh token is required', 400);
  }

  try {
    const payload = verifyRefreshToken(token);
    const storedToken = await redisClient.get(`refresh:${payload.id}`);

    if (!storedToken || storedToken !== token) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const user = await User.findByPk(payload.id);

    if (!user || !user.is_active) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);

    return successResponse(res, { accessToken }, 'Token refreshed successfully');
  } catch {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
};
