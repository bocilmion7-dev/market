import { prisma } from '../lib/prisma';

export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  const where = { userId };
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, readAt: null } }),
  ]);
  return { notifications, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function markAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) return null;
  return prisma.notification.update({ where: { id: notificationId }, data: { readAt: new Date() } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
}) {
  return prisma.notification.create({ data });
}
