import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createSlug } from '../lib/utils';

export async function listUsers(page = 1, limit = 20, search?: string) {
  const where = search ? {
    OR: [
      { email: { contains: search, mode: 'insensitive' as const } },
      { fullName: { contains: search, mode: 'insensitive' as const } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { roles: { include: { role: true } }, publisherProfile: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      status: u.status,
      roles: u.roles.map(ur => ur.role.name),
      publisherProfile: u.publisherProfile,
      createdAt: u.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createUser(data: { email: string; password: string; fullName: string; phone?: string; role: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      status: 'ACTIVE',
    },
  });

  const role = await prisma.role.findUnique({ where: { name: data.role } });
  if (role) {
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  if (data.role === 'PRODUCT_PUBLISHER') {
    await prisma.publisherProfile.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone || '',
        address: '',
        provinceId: '',
        cityId: '',
        districtId: '',
      },
    });
  }

  return { id: user.id, email: user.email, fullName: user.fullName };
}

export async function updateUser(id: string, data: { fullName?: string; phone?: string; status?: string }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const updated = await prisma.user.update({ where: { id }, data });
  return { id: updated.id, email: updated.email, fullName: updated.fullName, status: updated.status };
}

export async function updateUserRoles(id: string, roles: string[]) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  await prisma.userRole.deleteMany({ where: { userId: id } });
  for (const roleName of roles) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (role) {
      await prisma.userRole.create({ data: { userId: id, roleId: role.id } });
    }
  }

  return { id, roles };
}
