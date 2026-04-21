import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.type === 'field' ? error.path : 'request',
    message: error.msg
  }));

  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};
