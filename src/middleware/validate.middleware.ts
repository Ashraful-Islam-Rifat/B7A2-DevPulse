import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/app-error.js';

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Name, email, and password fields are strictly required');
  }
  if (role && !['contributor', 'maintainer'].includes(role)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Role parameters must accurately match contributor or maintainer');
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Email and password elements are strictly mandatory');
  }
  next();
};

export const validateIssueCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, type } = req.body;
  if (!title || !description || !type) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Title, description, and type values are mandatory');
  }
  if (title.length > 150) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Title footprint must not exceed 150 configurations');
  }
  if (description.length < 20) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Description must yield a length footprint of minimum 20 elements');
  }
  if (!['bug', 'feature_request'].includes(type)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', "Type categorizations must follow 'bug' or 'feature_request'");
  }
  next();
};