import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication required'));
    }
    if (!req.user.roles.some((r) => roles.includes(r))) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}

export function authorizePublisherOwnership(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication required'));
  }
  if (!req.user.roles.includes('PRODUCT_PUBLISHER') || !req.user.publisherProfileId) {
    return next(new AppError(403, 'FORBIDDEN', 'Not a publisher'));
  }
  next();
}