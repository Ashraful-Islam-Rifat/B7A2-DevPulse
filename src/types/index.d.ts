import { Request } from 'express';

export interface JwtPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}