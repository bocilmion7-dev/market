import { Router } from 'express';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/auth.schema';
import * as authService from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await authService.login(req.body.email, req.body.password);
    req.session!.userId = user.id;
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session?.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out' });
  });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;