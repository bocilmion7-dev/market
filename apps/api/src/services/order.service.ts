import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function createOrder(userId: string, data: {
  shippingAddressId: string;
  shippingService: string;
  shippingCourier: string;
  notes?: string;
  bankAccountId?: string;
  vaName?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  let customer = await prisma.customer.findFirst({ where: { email: user.email } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: user.fullName,
        email: user.email,
        phone: user.phone || '',
      },
    });
  }

  const shippingAddress = await prisma.customerAddress.findUnique({ where: { id: data.shippingAddressId } });
  if (!shippingAddress || shippingAddress.customerId !== customer.id) {
    throw new AppError(404, 'NOT_FOUND', 'Shipping address not found');
  }

  const cart = await prisma.cart.findFirst({
    where: { items: { some: { product: { publisherId: { not: undefined } } } } },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cart is empty');
  }

  const itemsByPublisher: Record<string, typeof cart.items> = {};
  for (const item of cart.items) {
    const pubId = item.product.publisherId;
    if (!itemsByPublisher[pubId]) itemsByPublisher[pubId] = [];
    itemsByPublisher[pubId].push(item);
  }

  const createdOrders = [];

  for (const [publisherId, items] of Object.entries(itemsByPublisher)) {
    const subtotalBestPrice = items.reduce((sum, item) => {
      const price = item.variant ? Number(item.variant.bestPrice) : Number(item.product.bestPrice);
      return sum + price * item.quantity;
    }, 0);

    const subtotalMarketplacePrice = items.reduce((sum, item) => {
      const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
      return sum + price * item.quantity;
    }, 0);

    const shippingCost = 15000;
    const grandTotal = subtotalMarketplacePrice + shippingCost;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        publisherId,
        customerId: customer.id,
        shippingAddressId: data.shippingAddressId,
        subtotalBestPrice,
        subtotalMarketplacePrice,
        shippingCost,
        grandTotal,
        orderStatus: 'PENDING_PAYMENT',
        paymentStatus: 'UNPAID',
        items: {
          create: items.map(item => {
            const bestPrice = item.variant ? Number(item.variant.bestPrice) : Number(item.product.bestPrice);
            const marketplacePrice = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
            const adminFeePercentage = item.variant ? Number(item.variant.adminFeePercentage) : Number(item.product.adminFeePercentage);
            const adminFeeAmount = item.variant ? Number(item.variant.adminFeeAmount) : Number(item.product.adminFeeAmount);
            return {
              productId: item.productId,
              variantId: item.variantId,
              productNameSnapshot: item.product.name,
              skuSnapshot: item.product.sku,
              variantSnapshot: item.variant ? JSON.stringify(item.variant.variantFormData) : null,
              bestPriceSnapshot: bestPrice,
              adminFeePercentageSnapshot: adminFeePercentage,
              adminFeeAmountSnapshot: adminFeeAmount,
              marketplacePriceSnapshot: marketplacePrice,
              quantity: item.quantity,
              subtotalBestPrice: bestPrice * item.quantity,
              subtotalMarketplacePrice: marketplacePrice * item.quantity,
              profit: adminFeeAmount * item.quantity,
            };
          }),
        },
      },
    });

    createdOrders.push(order);
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return createdOrders;
}

export async function getUserOrders(userId: string, page = 1, limit = 20) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  let customer = await prisma.customer.findFirst({ where: { email: user.email } });
  if (!customer) return { orders: [], total: 0, page, limit, totalPages: 0 };

  const where = { customerId: customer.id };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        publisher: true,
        shipment: { include: { tracking: { orderBy: { eventTime: 'asc' } } } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getOrderDetail(userId: string, orderId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  let customer = await prisma.customer.findFirst({ where: { email: user.email } });
  if (!customer) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
      shippingAddress: true,
      publisher: true,
      shipment: { include: { tracking: { orderBy: { eventTime: 'asc' } } } },
    },
  });
  if (!order || order.customerId !== customer.id) throw new AppError(404, 'NOT_FOUND', 'Order not found');
  return order;
}