import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createPaymentLink, verifyNotification, getPaymentStatus } from './midtrans.service';

export async function initiatePayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');

  const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
  if (existingPayment && existingPayment.status === 'PAID') {
    throw new AppError(400, 'ALREADY_PAID', 'Order is already paid');
  }

  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const midtransItems = items.map((item) => ({
    id: item.productId,
    price: Number(item.marketplacePriceSnapshot),
    quantity: item.quantity,
    name: item.productNameSnapshot,
  }));

  const customer = await prisma.customer.findUnique({ where: { id: order.customerId } });

  const { token, redirect_url } = await createPaymentLink(
    order.orderNumber,
    Number(order.grandTotal),
    midtransItems,
    { first_name: customer?.name || 'Customer', email: customer?.email || '' },
  );

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { providerTransactionId: token, status: 'PENDING' },
    });
  } else {
    await prisma.payment.create({
      data: {
        orderId,
        provider: 'MIDTRANS',
        amount: order.grandTotal,
        status: 'PENDING',
        providerTransactionId: token,
      },
    });
  }

  return { token, redirect_url };
}

export async function handlePaymentNotification(notification: any) {
  if (!verifyNotification(notification)) {
    throw new AppError(400, 'INVALID_SIGNATURE', 'Invalid notification signature');
  }

  const paymentStatus = getPaymentStatus(notification);

  const order = await prisma.order.findFirst({ where: { orderNumber: notification.order_id } });
  if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');

  const payment = await prisma.payment.findUnique({ where: { orderId: order.id } });

  if (!payment) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'MIDTRANS',
        amount: notification.gross_amount,
        status: paymentStatus,
        providerTransactionId: notification.transaction_id,
        paymentReference: notification.order_id,
      },
    });
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        providerTransactionId: notification.transaction_id || payment.providerTransactionId,
        paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
      },
    });
  }

  const orderStatusMap: Record<string, string> = {
    PAID: 'PAID',
    PENDING: 'PENDING_PAYMENT',
    FAILED: 'CANCELLED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'CANCELLED',
  };

  if (orderStatusMap[paymentStatus]) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: orderStatusMap[paymentStatus],
        paymentStatus: paymentStatus,
      },
    });
  }

  return { success: true };
}
