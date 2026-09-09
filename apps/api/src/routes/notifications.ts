import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationService from '../services/notification.service';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await notificationService.getUserNotifications(req.user!.id, page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/read-all', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
