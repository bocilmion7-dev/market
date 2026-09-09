import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        roles: string[];
        publisherProfileId?: string;
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.session?.id;
    if (!sessionId) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication required'));
    }

    const session = await prisma.session.findUnique({ where: { sid: sessionId } });
    if (!session) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Invalid session'));
    }

    const userId = (session.sess as any)?.userId;
    if (!userId) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Invalid session'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } }, publisherProfile: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return next(new AppError(401, 'AUTH_REQUIRED', 'User not found or inactive'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((ur) => ur.role.name),
      publisherProfileId: user.publisherProfile?.id,
    };

    next();
  } catch (err) {
    next(err);
  }
}