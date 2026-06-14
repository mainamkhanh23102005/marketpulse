import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(createError('Unauthorized', 401));
  }
  const token = header.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(createError('Unauthorized', 401));
  }
  req.user = { id: payload.id };
  next();
}
