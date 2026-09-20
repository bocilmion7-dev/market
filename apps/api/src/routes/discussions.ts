import { Router, NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router: Router = Router();

router.get('/products/:productId/discussions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const discussions = await prisma.discussion.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: discussions });
  } catch (err) { next(err); }
});

const createDiscussionSchema = z.object({
  customerName: z.string().min(1).max(150),
  email: z.string().email().max(255),
  question: z.string().min(1),
});

router.post('/products/:productId/discussions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const body = createDiscussionSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    }

    const discussion = await prisma.discussion.create({
      data: {
        productId,
        customerName: body.customerName,
        email: body.email,
        question: body.question,
      },
    });

    res.json({ success: true, data: discussion });
  } catch (err) { next(err); }
});

router.get('/products/:productId/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };
    const reviews = await prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

export default router;
