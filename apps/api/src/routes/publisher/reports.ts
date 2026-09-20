import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

const router: Router = Router();

router.get('/reports/sales', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const publisher = await prisma.publisherProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!publisher) throw new AppError(404, 'NOT_FOUND', 'Publisher profile not found');

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const where: any = {
      publisherId: publisher.id,
      orderStatus: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
    };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [orders, totalRevenue, totalOrders, averageOrder, topProducts, statusBreakdown] = await Promise.all([
      prisma.order.findMany({
        where,
        select: { grandTotal: true, createdAt: true, orderStatus: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.aggregate({ where, _sum: { grandTotal: true } }),
      prisma.order.count({ where }),
      prisma.order.aggregate({ where, _avg: { grandTotal: true } }),
      prisma.orderItem.findMany({
        where: { order: { publisherId: publisher.id, ...where } },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.order.groupBy({
        by: ['orderStatus'],
        where,
        _count: true,
        _sum: { grandTotal: true },
      }),
    ]);

    // Daily breakdown
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

    // Product breakdown
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of topProducts) {
      const pid = item.productId;
      const existing = productMap.get(pid) || { name: item.product?.name || 'Unknown', quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.subtotalMarketplacePrice);
      productMap.set(pid, existing);
    }
    const byProduct = Array.from(productMap.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Status breakdown
    const byStatus = statusBreakdown.map((s) => ({
      status: s.orderStatus,
      count: s._count,
      revenue: Number(s._sum.grandTotal) || 0,
    }));

    res.json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue._sum.grandTotal) || 0,
        totalOrders,
        averageOrder: Number(averageOrder._avg.grandTotal) || 0,
        byDay: Object.entries(byDay).map(([date, data]) => ({ date, ...data })),
        byProduct,
        byStatus,
      },
    });
  } catch (err) { next(err); }
});

export default router;
