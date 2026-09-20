import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { audit } from '../../middleware/audit';
import * as settingsService from '../../services/settings.service';

const router: Router = Router();

router.get('/', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const banners = await settingsService.getBanners();
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

router.put('/', authenticate, authorize('ADMIN_MAKER'), audit('BANNERS_UPDATE', 'Setting'), async (req, res, next) => {
  try {
    const banners = await settingsService.updateBanners(req.body.banners, req.user!.id);
    res.json({ success: true, data: banners });
  } catch (err) { next(err); }
});

export default router;
