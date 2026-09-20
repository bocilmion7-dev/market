import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/errorHandler';

const router: Router = Router();

router.get('/reviews', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search as string | undefined;

    const publisher = await prisma.publisherProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!publisher) throw new AppError(404, 'NOT_FOUND', 'Publisher profile not found');

    const productIds = await prisma.product.findMany({
      where: { publisherId: publisher.id },
      select: { id: true },
    });
    const ids = productIds.map((p) => p.id);

    const where: any = { productId: { in: ids } };
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { reviewText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { product: { select: { id: true, name: true, slug: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ success: true, data: { reviews, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.get('/discussions', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search as string | undefined;
    const filter = req.query.filter as string | undefined;

    const publisher = await prisma.publisherProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!publisher) throw new AppError(404, 'NOT_FOUND', 'Publisher profile not found');

    const productIds = await prisma.product.findMany({
      where: { publisherId: publisher.id },
      select: { id: true },
    });
    const ids = productIds.map((p) => p.id);

    const where: any = { productId: { in: ids } };
    if (filter === 'unanswered') {
      where.answer = null;
    } else if (filter === 'answered') {
      where.answer = { not: null };
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { question: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        include: { product: { select: { id: true, name: true, slug: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.discussion.count({ where }),
    ]);

    res.json({ success: true, data: { discussions, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.post('/discussions/:id/reply', authenticate, authorize('PRODUCT_PUBLISHER'), validate(z.object({
  answer: z.string().min(1, 'Balasan tidak boleh kosong'),
})), async (req, res, next) => {
  try {
    const discussion = await prisma.discussion.findUnique({
      where: { id: req.params.id as string },
      include: { product: { select: { publisherId: true } } },
    });
    if (!discussion) throw new AppError(404, 'NOT_FOUND', 'Discussion not found');
    if ((discussion as any).product.publisherId !== req.user!.publisherProfileId) {
      throw new AppError(403, 'FORBIDDEN', 'Not your product');
    }

    const updated = await prisma.discussion.update({
      where: { id: req.params.id as string },
      data: {
        answer: req.body.answer,
        answeredBy: req.user!.fullName,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

export default router;
