import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as orderService from '../services/order.service';

const router: Router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await orderService.getUserOrders(req.user!.id, page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const data = await orderService.getOrderDetail(req.user!.id, req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, validate(z.object({
  shippingAddressId: z.string(),
  recipientName: z.string().optional().default(''),
  recipientPhone: z.string().optional().default(''),
  shippingService: z.string().min(1, 'Shipping service is required'),
  shippingCourier: z.string().min(1, 'Shipping courier is required'),
  shippingCost: z.number().optional().default(0),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().positive(),
  })).min(1, 'Cart is empty'),
  destinationCityId: z.string().optional().default(''),
  destinationCityName: z.string().optional().default(''),
  destinationProvinceName: z.string().optional().default(''),
  destinationDistrictName: z.string().optional().default(''),
  destinationPostalCode: z.string().optional().default(''),
})), async (req, res, next) => {
  try {
    const data = await orderService.createOrder(req.user!.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;