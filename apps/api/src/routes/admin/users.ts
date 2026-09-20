import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, updateUserRolesSchema } from '../../validators/user.schema';
import * as userService from '../../services/user.service';
import { audit } from '../../middleware/audit';

const router: Router = Router();

router.get('/', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string;
    const data = await userService.listUsers(page, limit, search);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('ADMIN_MAKER'), validate(createUserSchema), audit('USER_CREATE', 'User'), async (req, res, next) => {
  try {
    const data = await userService.createUser(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('ADMIN_MAKER'), validate(updateUserSchema), audit('USER_UPDATE', 'User'), async (req, res, next) => {
  try {
    const data = await userService.updateUser(req.params.id as string, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id/roles', authenticate, authorize('ADMIN_MAKER'), validate(updateUserRolesSchema), audit('USER_ROLE_CHANGE', 'User'), async (req, res, next) => {
  try {
    const data = await userService.updateUserRoles(req.params.id as string, req.body.roles);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
