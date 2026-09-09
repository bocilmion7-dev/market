import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function listPublisherOrders(publisherId: string, page = 1, limit = 20, orderStatus?: string) {
  const where: any = { publisherId };
  if (orderStatus) where.orderStatus = orderStatus;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, customer: true, payment: true, shipment: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPublisherOrderDetail(publisherId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, customer: true, payment: true, shippingAddress: true, shipment: true },
  });
  if (!order || order.publisherId !== publisherId) throw new AppError(404, 'NOT_FOUND', 'Order not found');
  return order;
}

export async function updateOrderStatus(publisherId: string, orderId: string, newStatus: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.publisherId !== publisherId) throw new AppError(404, 'NOT_FOUND', 'Order not found');

  const validTransitions: Record<string, string[]> = {
    PAID: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: ['COMPLETED'],
  };

  if (!validTransitions[order.orderStatus]?.includes(newStatus)) {
    throw new AppError(400, 'VALIDATION_ERROR', `Cannot transition from ${order.orderStatus} to ${newStatus}`);
  }

  return prisma.order.update({ where: { id: orderId }, data: { orderStatus: newStatus } });
}

export async function addAWBNumber(publisherId: string, orderId: string, awbNumber: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { shipment: true } });
  if (!order || order.publisherId !== publisherId) throw new AppError(404, 'NOT_FOUND', 'Order not found');

  if (order.shipment) {
    await prisma.shipment.update({
      where: { id: order.shipment.id },
      data: { awb: awbNumber, status: 'SHIPPED', shippedAt: new Date() },
    });
  } else {
    await prisma.shipment.create({
      data: {
        orderId,
        publisherId,
        courier: 'TBD',
        service: 'TBD',
        shippingCost: order.shippingCost,
        weightGram: 1000,
        awb: awbNumber,
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
    });
  }

  return prisma.order.update({ where: { id: orderId }, data: { orderStatus: 'SHIPPED' } });
}
