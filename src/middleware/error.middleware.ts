import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
    return;
  }

  // Handle unique database constraints
  if ('code' in err && err.code === '23505') {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Resource or entry already exists',
      errors: err.message
    });
    return;
  }

  console.error('💥 Critical Error Triggered:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Unexpected server or database error',
    errors: process.env.NODE_ENV === 'development' ? err.message : null
  });
};