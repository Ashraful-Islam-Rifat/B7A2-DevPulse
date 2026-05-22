import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from './auth.service.js';
import { AppError } from '../../utils/app-error.js';
import { sendSuccess } from '../../utils/response.utils.js';
import bcrypt from 'bcrypt';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existingUser = await AuthService.findUserByEmail(req.body.email);
    if (existingUser) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Validation errors', 'Email has already been assigned onto an account');
    }

    const newUser = await AuthService.createUser(req.body);
    sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', newUser);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials provided');
    }

    const token = AuthService.generateToken(user);
    
    // Explicitly stripping password from user contextual tracking references
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    sendSuccess(res, StatusCodes.OK, 'Login successful', { token, user: userPayload });
  } catch (error) {
    next(error);
  }
};