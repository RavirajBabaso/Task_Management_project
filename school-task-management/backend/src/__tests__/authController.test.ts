import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { login, logout, changePassword, refreshToken } from '../controllers/authController';
import redisClient from '../config/redis';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils';

// Mock the models and utilities
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'STAFF',
  department_id: 1,
  password_hash: 'hashedpassword',
  is_active: true,
  last_login: new Date(),
  save: jest.fn()
};

const mockRequest = (body: any = {}, user?: any): Partial<Request> => ({
  body,
  user
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return JWT tokens for valid credentials', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'password123' });
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      (redisClient.set as jest.Mock).mockResolvedValue('OK');

      await login(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(generateAccessToken).toHaveBeenCalledWith(1, 'STAFF');
      expect(generateRefreshToken).toHaveBeenCalledWith(1);
      expect(redisClient.set).toHaveBeenCalledWith('refresh:1', 'refresh-token', 'EX', 604800);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'STAFF',
            department_id: 1
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        },
        message: 'Login successful'
      });
    });

    it('should return 401 for invalid email', async () => {
      const req = mockRequest({ email: 'invalid@example.com', password: 'password123' });
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 401 for wrong password', async () => {
      const req = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(req as Request, res as Response);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 400 for missing email or password', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Old password is incorrect'
      });
    });
  });

  describe('logout', () => {
    it('should remove refresh token from Redis', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      (redisClient.del as jest.Mock).mockResolvedValue(1);

      await logout(req as Request, res as Response);

      expect(redisClient.del).toHaveBeenCalledWith('refresh:1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Logout successful'
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication is required'
      });
    });
  });

  describe('changePassword', () => {
    it('should hash new password and update user', async () => {
      const req = mockRequest(
        { oldPassword: 'oldpass', newPassword: 'newpass' },
        { id: 1 }
      );
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');

      await changePassword(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'hashedpassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 12);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Password changed successfully'
      });
    });

    it('should return 400 for incorrect old password', async () => {
      const req = mockRequest(
        { oldPassword: 'wrongoldpass', newPassword: 'newpass' },
        { id: 1 }
      );
      const res = mockResponse();

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await changePassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication is required'
      });
    });

    it('should return 400 for missing passwords', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await changePassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Old password and new password are required'
      });
    });
  });

  describe('refreshToken', () => {
    it('should validate stored refresh token and return new access token', async () => {
      const req = mockRequest({ refreshToken: 'valid-refresh-token' });
      const res = mockResponse();

      (verifyRefreshToken as jest.Mock).mockReturnValue({ id: 1 });
      (redisClient.get as jest.Mock).mockResolvedValue('valid-refresh-token');
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (generateAccessToken as jest.Mock).mockReturnValue('new-access-token');

      await refreshToken(req as Request, res as Response);

      expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(redisClient.get).toHaveBeenCalledWith('refresh:1');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(generateAccessToken).toHaveBeenCalledWith(1, 'STAFF');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { accessToken: 'new-access-token' },
        message: 'Token refreshed successfully'
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      const req = mockRequest({ refreshToken: 'invalid-token' });
      const res = mockResponse();

      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await refreshToken(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token'
      });
    });

    it('should return 401 for token not in Redis', async () => {
      const req = mockRequest({ refreshToken: 'stolen-token' });
      const res = mockResponse();

      (verifyRefreshToken as jest.Mock).mockReturnValue({ id: 1 });
      (redisClient.get as jest.Mock).mockResolvedValue(null);

      await refreshToken(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token'
      });
    });
  });
});