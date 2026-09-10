import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  const userId = req.session.userId!;
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { media: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: items });
});

// Add to wishlist
router.post('/', authenticate, async (req, res) => {
  const userId = req.session.userId!;
  const { productId } = req.body;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    return res.json({ success: true, data: existing });
  }

  const item = await prisma.wishlistItem.create({
    data: { userId, productId },
  });

  res.json({ success: true, data: item });
});

// Remove from wishlist
router.delete('/:productId', authenticate, async (req, res) => {
  const userId = req.session.userId!;
  const { productId } = req.params;

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });

  res.json({ success: true });
});

// Get wishlist count for a product
router.get('/count/:productId', async (req, res) => {
  const { productId } = req.params;
  const count = await prisma.wishlistItem.count({ where: { productId } });
  res.json({ success: true, data: { count } });
});

export default router;
