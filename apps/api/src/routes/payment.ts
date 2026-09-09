import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as paymentService from '../services/payment.service';

const router = Router();

router.post('/initiate', authenticate, validate(z.object({
  orderId: z.string().uuid(),
})), async (req, res, next) => {
  try {
    const data = await paymentService.initiatePayment(req.body.orderId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/notification', async (req, res, next) => {
  try {
    const data = await paymentService.handlePaymentNotification(req.body);
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
