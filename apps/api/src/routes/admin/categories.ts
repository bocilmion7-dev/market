import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../../validators/category.schema';
import * as categoryService from '../../services/category.service';
import { audit } from '../../middleware/audit';

const router = Router();

router.get('/', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await categoryService.listCategories();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('ADMIN_MAKER'), validate(createCategorySchema), audit('CATEGORY_CREATE', 'Category'), async (req, res, next) => {
  try {
    const data = await categoryService.createCategory(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('ADMIN_MAKER'), validate(updateCategorySchema), audit('CATEGORY_UPDATE', 'Category'), async (req, res, next) => {
  try {
    const data = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('ADMIN_MAKER'), audit('CATEGORY_DELETE', 'Category'), async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
});

export default router;
