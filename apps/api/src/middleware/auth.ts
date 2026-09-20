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
        publisherProfileComplete?: boolean;
      };
      guestId?: string;
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
      publisherProfileComplete: !!user.publisherProfile?.address && !!user.publisherProfile?.provinceId && !!user.publisherProfile?.cityId && !!user.publisherProfile?.districtId && !!user.publisherProfile?.postalCode,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export async function authenticateOrGuest(req: Request, res: Response, next: NextFunction) {
  try {
    // Check for guest header first (always set if present)
    const guestId = req.headers['x-guest-id'] as string | undefined;
    if (guestId && guestId.length > 0) {
      req.guestId = guestId;
    }

    // Try normal auth
    const sessionId = req.session?.id;
    if (sessionId) {
      const session = await prisma.session.findUnique({ where: { sid: sessionId } });
      if (session) {
        const userId = (session.sess as any)?.userId;
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: { include: { role: true } }, publisherProfile: true },
          });
          if (user && user.status === 'ACTIVE') {
            req.user = {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              roles: user.roles.map((ur) => ur.role.name),
              publisherProfileId: user.publisherProfile?.id,
            };
          }
        }
      }
    }

    // Require either user or guest
    if (!req.user && !req.guestId) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication required'));
    }

    next();
  } catch (err) {
    next(err);
  }
}

export async function getWishlistUserId(req: Request): Promise<string> {
  if (req.user?.id) {
    return req.user.id;
  }

  if (req.guestId) {
    // Find or create guest user
    const guestEmail = `guest-${req.guestId}@marketplace.local`;
    let guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email: guestEmail,
          passwordHash: 'GUEST_NO_PASSWORD',
          fullName: 'Guest User',
          phone: '',
          status: 'INACTIVE',
        },
      });
    }

    return guestUser.id;
  }

  throw new AppError(401, 'AUTH_REQUIRED', 'No user identified');
}
