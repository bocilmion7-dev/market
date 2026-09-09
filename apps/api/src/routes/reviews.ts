import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as reviewService from '../services/review.service';

const router = Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await reviewService.getProductReviews(req.params.productId, page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate(z.object({
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})), async (req, res, next) => {
  try {
    const data = await reviewService.createReview(req.user!.id, req.body.productId, req.body.rating, req.body.comment);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
