import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function createOrder(userId: string, data: {
  shippingAddressId: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingService: string;
  shippingCourier: string;
  shippingCost?: number;
  notes?: string;
  items: OrderItemInput[];
  destinationCityId?: string;
  destinationCityName?: string;
  destinationProvinceName?: string;
  destinationDistrictName?: string;
  destinationPostalCode?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  let customer = await prisma.customer.findFirst({ where: { email: user.email } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: user.fullName,
        email: user.email,
        phone: data.recipientPhone || user.phone || '',
      },
    });
  } else if (!customer.phone && data.recipientPhone) {
    await prisma.customer.update({ where: { id: customer.id }, data: { phone: data.recipientPhone } });
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.shippingAddressId);
  let resolvedAddressId = data.shippingAddressId;
  if (isUuid) {
    const shippingAddress = await prisma.customerAddress.findUnique({ where: { id: data.shippingAddressId } });
    if (!shippingAddress || shippingAddress.customerId !== customer.id) {
      throw new AppError(404, 'NOT_FOUND', 'Shipping address not found');
    }
    resolvedAddressId = shippingAddress.id;
  } else {
    const tempAddress = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        recipientName: data.recipientName || user.fullName,
        phone: data.recipientPhone || user.phone || '',
        address: data.shippingAddressId,
        provinceId: '',
        provinceName: data.destinationProvinceName || '',
        cityId: data.destinationCityId || '',
        cityName: data.destinationCityName || '',
        districtId: '',
        districtName: data.destinationDistrictName || '',
        postalCode: data.destinationPostalCode || '',
      },
    });
    resolvedAddressId = tempAddress.id;
  }

  // Fetch products from request items
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Fetch variants if any
  const variantIds = data.items.filter((i) => i.variantId).map((i) => i.variantId!);
  const variants = variantIds.length > 0
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
    : [];
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // Build items grouped by publisher
  const itemsByPublisher: Record<string, { product: any; variant?: any; quantity: number }[]> = {};
  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new AppError(404, 'NOT_FOUND', `Product ${item.productId} not found`);
    if (!product.publisherId) throw new AppError(400, 'VALIDATION_ERROR', 'Product has no publisher');

    const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
    if (item.variantId && !variant) throw new AppError(404, 'NOT_FOUND', `Variant ${item.variantId} not found`);

    if (!itemsByPublisher[product.publisherId]) itemsByPublisher[product.publisherId] = [];
    itemsByPublisher[product.publisherId].push({ product, variant, quantity: item.quantity });
  }

  const totalSubtotal = Object.values(itemsByPublisher).reduce((sum, items) => {
    return sum + items.reduce((s, item) => {
      const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
      return s + price * item.quantity;
    }, 0);
  }, 0);

  const totalShippingCost = data.shippingCost || 0;
  const createdOrders = [];

  for (const [publisherId, items] of Object.entries(itemsByPublisher)) {
    const subtotalMarketplacePrice = items.reduce((sum, item) => {
      const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
      return sum + price * item.quantity;
    }, 0);

    const shippingCost = totalSubtotal > 0
      ? Math.round((subtotalMarketplacePrice / totalSubtotal) * totalShippingCost)
      : 0;
    const grandTotal = subtotalMarketplacePrice + shippingCost;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        publisherId,
        customerId: customer.id,
        shippingAddressId: resolvedAddressId,
        subtotalBestPrice: items.reduce((sum, item) => {
          const price = item.variant ? Number(item.variant.bestPrice) : Number(item.product.bestPrice);
          return sum + price * item.quantity;
        }, 0),
        subtotalMarketplacePrice,
        shippingCost,
        grandTotal,
        orderStatus: 'PENDING_PAYMENT',
        paymentStatus: 'UNPAID',
        shippingCourier: data.shippingCourier || null,
        shippingService: data.shippingService || null,
        notes: data.notes,
        items: {
          create: items.map(item => {
            const bestPrice = item.variant ? Number(item.variant.bestPrice) : Number(item.product.bestPrice);
            const marketplacePrice = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
            const adminFeePercentage = item.variant ? Number(item.variant.adminFeePercentage) : Number(item.product.adminFeePercentage);
            const adminFeeAmount = item.variant ? Number(item.variant.adminFeeAmount) : Number(item.product.adminFeeAmount);
            return {
              productId: item.product.id,
              variantId: item.variant?.id || null,
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

  // Return first order (usually single order, but could be split by publisher)
  return createdOrders[0];
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
      items: {
        include: {
          product: true,
        },
      },
      payment: true,
      shippingAddress: true,
      publisher: true,
      shipment: { include: { tracking: { orderBy: { eventTime: 'asc' } } } },
    },
  });
  if (!order || order.customerId !== customer.id) throw new AppError(404, 'NOT_FOUND', 'Order not found');
  return order;
}
