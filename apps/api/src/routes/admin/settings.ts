import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import * as settingsService from '../../services/settings.service';
import { audit } from '../../middleware/audit';
import { validate } from '../../middleware/validate';
import { updateAdminFeeSchema } from '../../validators/settings.schema';

const router = Router();

router.get('/', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getSettings();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/admin-fee', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getAdminFee();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/admin-fee', authenticate, authorize('ADMIN_MAKER'), validate(updateAdminFeeSchema), audit('ADMIN_FEE_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const { percentage } = req.body;
    const data = await settingsService.updateAdminFee(percentage, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
