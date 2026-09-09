import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import * as reportService from '../../services/report.service';
import * as auditService from '../../services/audit.service';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await reportService.getDashboardStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/sales', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await reportService.getSalesReport(
      req.query.startDate as string,
      req.query.endDate as string
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/publishers', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await reportService.getPublisherReport(req.query.publisherId as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await auditService.getAuditLogs(page, 50, {
      userId: req.query.userId as string,
      action: req.query.action as string,
      entityType: req.query.entityType as string,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
