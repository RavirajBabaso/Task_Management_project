import { UserRole } from '../models/enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole | string;
      };
    }
  }
}

export {};