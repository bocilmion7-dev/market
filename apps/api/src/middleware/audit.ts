import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export function audit(action: string, entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (body?.success && req.user) {
        prisma.auditLog.create({
          data: {
            actorUserId: req.user.id,
            action,
            entityType,
            entityId: req.params.id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
        }).catch(console.error);
      }
      return originalJson(body);
    };
    next();
  };
}