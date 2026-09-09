import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getOrCreateCart(sessionId: string) {
  let cart = await prisma.cart.findUnique({ where: { sessionId } });
  if (!cart) cart = await prisma.cart.create({ data: { sessionId } });
  return cart;
}

export async function getCartItems(sessionId: string) {
  const cart = await getOrCreateCart(sessionId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: { include: { media: true, publisher: true } },
      variant: true,
    },
  });
  return items;
}

export async function addToCart(sessionId: string, productId: string, quantity: number, variantId?: string) {
  const cart = await getOrCreateCart(sessionId);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  if (product.status !== 'PUBLISHED') throw new AppError(400, 'VALIDATION_ERROR', 'Product not available');

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId || null },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    const availableStock = variantId 
      ? (await prisma.productVariant.findUnique({ where: { id: variantId } }))?.stock ?? 0 
      : product.stock;
    if (newQty > availableStock) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Insufficient stock');
    }
    return prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
      quantity,
    },
  });
}

export async function updateCartItem(sessionId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(sessionId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) throw new AppError(404, 'NOT_FOUND', 'Cart item not found');

  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }
  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeFromCart(sessionId: string, itemId: string) {
  const cart = await getOrCreateCart(sessionId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) throw new AppError(404, 'NOT_FOUND', 'Cart item not found');
  return prisma.cartItem.delete({ where: { id: itemId } });
}