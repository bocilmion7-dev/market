import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as wishlistService from '../services/wishlist.service';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await wishlistService.getWishlist(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate(z.object({ productId: z.string().uuid() })), async (req, res, next) => {
  try {
    const data = await wishlistService.addToWishlist(req.user!.id, req.body.productId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    await wishlistService.removeFromWishlist(req.user!.id, req.params.productId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
