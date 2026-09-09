import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import * as publisherOrderService from '../../services/publisher-order.service';

const router = Router();

router.get('/', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const status = req.query.status as string;
    const data = await publisherOrderService.listPublisherOrders(req.user!.publisherProfileId!, page, 20, status);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const data = await publisherOrderService.getPublisherOrderDetail(req.user!.publisherProfileId!, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id/status', authenticate, authorize('PRODUCT_PUBLISHER'), validate(z.object({ status: z.string() })), async (req, res, next) => {
  try {
    const data = await publisherOrderService.updateOrderStatus(req.user!.publisherProfileId!, req.params.id, req.body.status);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/:id/awb', authenticate, authorize('PRODUCT_PUBLISHER'), validate(z.object({ awbNumber: z.string().min(1) })), async (req, res, next) => {
  try {
    const data = await publisherOrderService.addAWBNumber(req.user!.publisherProfileId!, req.params.id, req.body.awbNumber);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
