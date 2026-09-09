import { prisma } from '../lib/prisma';

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { media: true, category: true, publisher: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const existing = await prisma.wishlistItem.findFirst({ where: { userId, productId } });
  if (existing) return existing;

  return prisma.wishlistItem.create({ data: { userId, productId } });
}

export async function removeFromWishlist(userId: string, productId: string) {
  return prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}
