import { prisma } from '../lib/prisma';

export async function getSalesReport(startDate?: string, endDate?: string) {
  const where: any = {
    orderStatus: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
  };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [orders, totalRevenue, totalOrders, averageOrder] = await Promise.all([
    prisma.order.findMany({
      where,
      select: { grandTotal: true, createdAt: true, orderStatus: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.order.aggregate({ where, _sum: { grandTotal: true } }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where, _avg: { grandTotal: true } }),
  ]);

  const byDay = orders.reduce(
    (acc: Record<string, { count: number; revenue: number }>, order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { count: 0, revenue: 0 };
      acc[day].count += 1;
      acc[day].revenue += Number(order.grandTotal);
      return acc;
    },
    {},
  );

  return {
    totalRevenue: Number(totalRevenue._sum.grandTotal) || 0,
    totalOrders,
    averageOrder: Number(averageOrder._avg.grandTotal) || 0,
    byDay: Object.entries(byDay).map(([date, data]) => ({ date, ...data })),
  };
}

export async function getPublisherReport(publisherId?: string) {
  const where: any = {
    orderStatus: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
  };
  if (publisherId) where.publisherId = publisherId;

  const byPublisher = await prisma.order.groupBy({
    by: ['publisherId'],
    where,
    _sum: { grandTotal: true },
    _count: true,
  });

  const results = [];
  for (const group of byPublisher) {
    const publisher = await prisma.publisherProfile.findUnique({
      where: { id: group.publisherId },
    });
    results.push({
      publisherId: group.publisherId,
      publisherName: publisher?.fullName || 'Unknown',
      totalRevenue: Number(group._sum.grandTotal) || 0,
      orderCount: group._count,
    });
  }

  return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export async function getDashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalPublishers,
    pendingApprovals,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.publisherProfile.count(),
    prisma.product.count({ where: { status: 'PENDING_APPROVAL' } }),
    prisma.order.findMany({
      take: 10,
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalPublishers,
    pendingApprovals,
    recentOrders,
  };
}
