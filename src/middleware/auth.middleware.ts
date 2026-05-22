import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/app-error.js';
import { JwtPayload } from '../types/index.js';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token');
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(StatusCodes.UNAUTHORIZED, 'Missing, expired, or invalid JWT token'));
  }
};

export const authorize = (...allowedRoles: ('contributor' | 'maintainer')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Valid token but insufficient role/permissions');
    }
    next();
  };
};