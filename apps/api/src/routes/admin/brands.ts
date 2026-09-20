import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createBrandSchema, updateBrandSchema } from '../../validators/brand.schema';
import * as brandService from '../../services/brand.service';
import { audit } from '../../middleware/audit';

const router: Router = Router();

router.get('/', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await brandService.listBrands();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('ADMIN_MAKER'), validate(createBrandSchema), audit('BRAND_CREATE', 'Brand'), async (req, res, next) => {
  try {
    const data = await brandService.createBrand(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('ADMIN_MAKER'), validate(updateBrandSchema), audit('BRAND_UPDATE', 'Brand'), async (req, res, next) => {
  try {
    const data = await brandService.updateBrand(req.params.id as string, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('ADMIN_MAKER'), audit('BRAND_DELETE', 'Brand'), async (req, res, next) => {
  try {
    await brandService.deleteBrand(req.params.id as string);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) { next(err); }
});

export default router;
