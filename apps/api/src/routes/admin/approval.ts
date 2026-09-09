import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import * as approvalService from '../../services/approval.service';

const router = Router();

router.get('/pending-products', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await approvalService.listPendingProducts(page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/products/:id/approve', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await approvalService.approveProduct(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/products/:id/reject', authenticate, authorize('ADMIN_MAKER'), validate(z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})), async (req, res, next) => {
  try {
    const data = await approvalService.rejectProduct(req.params.id, req.user!.id, req.body.reason);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
