import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as cartService from '../services/cart.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.session?.id;
    if (!sessionId) return res.json({ success: true, data: [] });
    const items = await cartService.getCartItems(sessionId);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.post('/items', validate(z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  variantId: z.string().uuid().optional(),
})), async (req, res, next) => {
  try {
    const sessionId = req.session?.id;
    if (!sessionId) return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Session required' } });
    const item = await cartService.addToCart(sessionId, req.body.productId, req.body.quantity, req.body.variantId);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.patch('/items/:id', validate(z.object({
  quantity: z.number().int().min(0),
})), async (req, res, next) => {
  try {
    const sessionId = req.session?.id;
    if (!sessionId) return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Session required' } });
    const item = await cartService.updateCartItem(sessionId, req.params.id, req.body.quantity);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.delete('/items/:id', async (req, res, next) => {
  try {
    const sessionId = req.session?.id;
    if (!sessionId) return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Session required' } });
    await cartService.removeFromCart(sessionId, req.params.id);
    res.json({ success: true, data: { message: 'Removed' } });
  } catch (err) { next(err); }
});

export default router;