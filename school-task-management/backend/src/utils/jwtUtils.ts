import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../models';

export interface AccessTokenPayload {
  id: number;
  role: UserRole | string;
}

export interface RefreshTokenPayload {
  id: number;
}

export const generateAccessToken = (userId: number, role: UserRole | string) => {
  return jwt.sign({ id: userId, role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ id: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
};
