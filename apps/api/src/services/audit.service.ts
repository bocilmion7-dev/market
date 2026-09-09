import { prisma } from '../lib/prisma';

export async function getAuditLogs(
  page = 1,
  limit = 50,
  filters?: { userId?: string; action?: string; entityType?: string }
) {
  const where: any = {};
  if (filters?.userId) where.actorUserId = filters.userId;
  if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
  if (filters?.entityType) where.entityType = filters.entityType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
