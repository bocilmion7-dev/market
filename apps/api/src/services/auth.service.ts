import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } }, publisherProfile: true },
  });

  if (!user) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Invalid credentials');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(403, 'FORBIDDEN', 'Account is not active');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Invalid credentials');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles.map((ur) => ur.role.name),
    publisherProfileId: user.publisherProfile?.id,
  };
}