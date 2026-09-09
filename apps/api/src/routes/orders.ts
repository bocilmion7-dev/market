import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as orderService from '../services/order.service';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await orderService.getUserOrders(req.user!.id, page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const data = await orderService.getOrderDetail(req.user!.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate(z.object({
  shippingAddressId: z.string().uuid(),
  shippingService: z.string(),
  shippingCourier: z.string(),
  notes: z.string().optional(),
  bankAccountId: z.string().uuid().optional(),
  vaName: z.string().optional(),
})), async (req, res, next) => {
  try {
    const data = await orderService.createOrder(req.user!.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;