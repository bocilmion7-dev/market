import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateOrGuest, getWishlistUserId } from '../middleware/auth';

const router: Router = Router();

// Get user's wishlist (logged-in or guest)
router.get('/', authenticateOrGuest, async (req, res) => {
  const userId = await getWishlistUserId(req);
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { media: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: items });
});

// Add to wishlist (logged-in or guest)
router.post('/', authenticateOrGuest, async (req, res) => {
  const userId = await getWishlistUserId(req);
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

// Remove from wishlist (logged-in or guest)
router.delete('/:productId', authenticateOrGuest, async (req, res) => {
  const userId = await getWishlistUserId(req);
  const { productId } = req.params as { productId: string };

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });

  res.json({ success: true });
});

// Merge guest wishlist into user's wishlist (called after login/register)
router.post('/merge', authenticateOrGuest, async (req, res) => {
  const userId = req.user?.id;
  const guestId = req.guestId;

  if (!userId) {
    return res.json({ success: true, data: { merged: 0 } });
  }

  // If guest, merge guest wishlist into real user
  if (guestId) {
    const guestEmail = `guest-${guestId}@marketplace.local`;
    const guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });

    if (guestUser) {
      // Get guest wishlist items
      const guestItems = await prisma.wishlistItem.findMany({
        where: { userId: guestUser.id },
      });

      let merged = 0;
      for (const item of guestItems) {
        try {
          await prisma.wishlistItem.upsert({
            where: { userId_productId: { userId, productId: item.productId } },
            update: {},
            create: { userId, productId: item.productId },
          });
          merged++;
        } catch {}
      }

      // Delete guest wishlist and guest user
      await prisma.wishlistItem.deleteMany({ where: { userId: guestUser.id } });
      await prisma.user.delete({ where: { id: guestUser.id } });

      return res.json({ success: true, data: { merged } });
    }
  }

  res.json({ success: true, data: { merged: 0 } });
});

// Get wishlist count for a product (public, no auth)
router.get('/count/:productId', async (req, res) => {
  const { productId } = req.params;
  const count = await prisma.wishlistItem.count({ where: { productId } });
  res.json({ success: true, data: { count } });
});

export default router;
