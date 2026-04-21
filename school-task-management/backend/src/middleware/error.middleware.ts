import { NextFunction, Request, Response } from 'express';

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  errors?: unknown;
};

export const errorHandler = (
  error: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode ?? error.status ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors ? { errors: error.errors } : {})
  });
};
