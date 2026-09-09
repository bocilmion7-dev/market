import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function listPendingProducts(page = 1, limit = 20) {
  const where = { status: 'PENDING_APPROVAL' as const };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { publisher: true, category: true, brand: true, media: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveProduct(productId: string, reviewerId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  if (product.status !== 'PENDING_APPROVAL') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Product is not pending approval');
  }

  return prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { status: 'PUBLISHED' },
    }),
    prisma.productApprovalHistory.create({
      data: {
        productId,
        reviewerId,
        action: 'APPROVED',
      },
    }),
  ]);
}

export async function rejectProduct(productId: string, reviewerId: string, reason: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  if (product.status !== 'PENDING_APPROVAL') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Product is not pending approval');
  }

  return prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    }),
    prisma.productApprovalHistory.create({
      data: {
        productId,
        reviewerId,
        action: 'REJECTED',
        note: reason,
      },
    }),
  ]);
}
