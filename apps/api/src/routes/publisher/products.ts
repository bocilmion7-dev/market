import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createProductSchema, updateProductSchema } from '../../validators/product.schema';
import * as productService from '../../services/product.service';

const router = Router();

router.get('/', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await productService.listPublisherProducts(req.user!.publisherProfileId!, page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('PRODUCT_PUBLISHER'), validate(createProductSchema), async (req, res, next) => {
  try {
    const data = await productService.createProduct(req.user!.publisherProfileId!, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const data = await productService.getProduct(req.user!.publisherProfileId!, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('PRODUCT_PUBLISHER'), validate(updateProductSchema), async (req, res, next) => {
  try {
    const data = await productService.updateProduct(req.user!.publisherProfileId!, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/:id/submit', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const data = await productService.submitForApproval(req.user!.publisherProfileId!, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
