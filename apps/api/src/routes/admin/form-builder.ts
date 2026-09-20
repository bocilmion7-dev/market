import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { saveFormSchema } from '../../validators/form-builder.schema';
import * as formBuilderService from '../../services/form-builder.service';
import { audit } from '../../middleware/audit';

const router: Router = Router();

// Category Form Schema
router.get('/categories/:id/form-schema', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await formBuilderService.getCategoryFormSchema(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/categories/:id/form-schema/draft', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await formBuilderService.getCategoryFormSchemaDraft(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/categories/:id/form-schema', authenticate, authorize('ADMIN_MAKER'), validate(saveFormSchema), audit('CATEGORY_SCHEMA_CHANGE', 'CategoryFormSchema'), async (req, res, next) => {
  try {
    const data = await formBuilderService.saveCategoryFormSchema(req.params.id as string, req.body.fields, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/categories/:id/form-schema/publish', authenticate, authorize('ADMIN_MAKER'), audit('CATEGORY_SCHEMA_CHANGE', 'CategoryFormSchema'), async (req, res, next) => {
  try {
    const data = await formBuilderService.publishCategoryFormSchema(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// Variant Form Schema
router.get('/categories/:id/variant-schema', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await formBuilderService.getVariantFormSchema(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/categories/:id/variant-schema/draft', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await formBuilderService.getVariantFormSchemaDraft(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/categories/:id/variant-schema', authenticate, authorize('ADMIN_MAKER'), validate(saveFormSchema), audit('VARIANT_SCHEMA_CHANGE', 'VariantFormSchema'), async (req, res, next) => {
  try {
    const data = await formBuilderService.saveVariantFormSchema(req.params.id as string, req.body.fields, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/categories/:id/variant-schema/publish', authenticate, authorize('ADMIN_MAKER'), audit('VARIANT_SCHEMA_CHANGE', 'VariantFormSchema'), async (req, res, next) => {
  try {
    const data = await formBuilderService.publishVariantFormSchema(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
