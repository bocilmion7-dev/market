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
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
      payment: true,
      shippingAddress: true,
      shipment: true,
      publisher: {
        select: {
          fullName: true,
          phone: true,
          address: true,
          postalCode: true,
          cityId: true,
          districtId: true,
        },
      },
    },
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

export async function addAWBNumber(publisherId: string, orderId: string, awbNumber: string, courier?: string, service?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { shipment: true } });
  if (!order || order.publisherId !== publisherId) throw new AppError(404, 'NOT_FOUND', 'Order not found');

  const resolvedCourier = courier || order.shippingCourier || 'TBD';
  const resolvedService = service || order.shippingService || 'TBD';

  if (order.shipment) {
    await prisma.shipment.update({
      where: { id: order.shipment.id },
      data: { awb: awbNumber, courier: resolvedCourier, service: resolvedService },
    });
  } else {
    const orderWithItems = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    const totalWeightGrams = (orderWithItems?.items as any[])?.reduce((sum: number, item: any) => {
      return sum + (item.product?.weight || 0) * item.quantity;
    }, 0) || 0;

    await prisma.shipment.create({
      data: {
        orderId,
        publisherId,
        courier: resolvedCourier,
        service: resolvedService,
        shippingCost: order.shippingCost,
        weightGram: totalWeightGrams || 1,
        awb: awbNumber,
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
    });
    await prisma.order.update({ where: { id: orderId }, data: { orderStatus: 'SHIPPED' } });
  }

  return { id: order.id };
}
