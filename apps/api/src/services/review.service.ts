import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getProductReviews(productId: string, page = 1, limit = 10) {
  const where = { productId, status: 'APPROVED' };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }),
  ]);

  const avgRating = await prisma.review.aggregate({
    where,
    _avg: { rating: true },
  });

  return { reviews, total, avgRating: avgRating._avg.rating || 0, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createReview(userId: string, productId: string, rating: number, comment?: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');

  const existing = await prisma.review.findFirst({
    where: { productId, customerName: userId },
  });
  if (existing) throw new AppError(400, 'VALIDATION_ERROR', 'You already reviewed this product');

  return prisma.review.create({
    data: {
      productId,
      orderId: '',
      orderItemId: '',
      rating,
      reviewText: comment || '',
      customerName: userId,
      status: 'APPROVED',
    },
  });
}
