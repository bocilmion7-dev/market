import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import * as settingsService from '../../services/settings.service';
import { audit } from '../../middleware/audit';

const router: Router = Router();

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

router.patch('/admin-fee', authenticate, authorize('ADMIN_MAKER'), audit('ADMIN_FEE_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const { percentage } = req.body;
    const data = await settingsService.updateAdminFee(percentage, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/site-name', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const name = await settingsService.getSiteName();
    res.json({ success: true, data: { name } });
  } catch (err) { next(err); }
});

router.put('/site-name', authenticate, authorize('ADMIN_MAKER'), audit('SITE_NAME_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateSiteName(req.body.name, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/site-footer', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getSiteFooter();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/site-footer', authenticate, authorize('ADMIN_MAKER'), audit('SITE_FOOTER_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateSiteFooter(req.body, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/announcement', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const text = await settingsService.getAnnouncementText();
    res.json({ success: true, data: { text } });
  } catch (err) { next(err); }
});

router.put('/announcement', authenticate, authorize('ADMIN_MAKER'), audit('ANNOUNCEMENT_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateAnnouncementText(req.body.text, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/public', async (req, res, next) => {
  try {
    const [siteName, siteFooter] = await Promise.all([
      settingsService.getSiteName(),
      settingsService.getSiteFooter(),
    ]);
    res.json({ success: true, data: { siteName, siteFooter } });
  } catch (err) { next(err); }
});

router.get('/shipping-providers', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getShippingProviders();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/shipping-providers', authenticate, authorize('ADMIN_MAKER'), audit('SHIPPING_PROVIDERS_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateShippingProviders(req.body.providers, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/active-couriers', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getActiveCouriers();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/active-couriers', authenticate, authorize('ADMIN_MAKER'), audit('ACTIVE_COURIERS_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateActiveCouriers(req.body.couriers, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/shipping-public', async (req, res, next) => {
  try {
    const [providers, couriers] = await Promise.all([
      settingsService.getShippingProviders(),
      settingsService.getActiveCouriers(),
    ]);
    const enabledProviderIds = providers.filter((p) => p.enabled).map((p) => p.id);
    const activeCouriers = couriers.map((c) => ({
      ...c,
      providers: c.providers.filter((p) => enabledProviderIds.includes(p)),
    })).filter((c) => c.providers.length > 0);
    res.json({ success: true, data: { providers: providers.filter((p) => p.enabled).map((p) => ({ id: p.id, name: p.name })), couriers: activeCouriers } });
  } catch (err) { next(err); }
});

router.get('/midtrans', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getMidtransSettings();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/midtrans', authenticate, authorize('ADMIN_MAKER'), audit('MIDTRANS_SETTINGS_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateMidtransSettings(req.body, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/qris', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getQrisSettings();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/qris', authenticate, authorize('ADMIN_MAKER'), audit('QRIS_SETTINGS_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateQrisSettings(req.body, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/whatsapp', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const data = await settingsService.getWhatsappSettings();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/whatsapp', authenticate, authorize('ADMIN_MAKER'), audit('WHATSAPP_SETTINGS_CHANGE', 'Setting'), async (req, res, next) => {
  try {
    const data = await settingsService.updateWhatsappSettings(req.body, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/payment-public', async (req, res, next) => {
  try {
    const [qris, whatsapp] = await Promise.all([
      settingsService.getQrisSettings(),
      settingsService.getWhatsappSettings(),
    ]);
    res.json({ success: true, data: { qris, whatsapp } });
  } catch (err) { next(err); }
});

export default router;
