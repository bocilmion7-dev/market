import { Router } from 'express';
import * as storefrontService from '../services/storefront.service';
import { getPublicBanners } from '../services/settings.service';

const router = Router();

router.get('/homepage', async (req, res, next) => {
  try {
    const homepage = await storefrontService.getHomepage();
    const banners = await getPublicBanners();
    res.json({ success: true, data: { ...homepage, banners } });
  } catch (err) { next(err); }
});

router.get('/products', async (req, res, next) => {
  try {
    const data = await storefrontService.listProducts({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      categoryId: req.query.categoryId as string,
      search: req.query.search as string,
      minPrice: Number(req.query.minPrice) || undefined,
      maxPrice: Number(req.query.maxPrice) || undefined,
      sort: req.query.sort as string,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/products/:slug', async (req, res, next) => {
  try {
    const data = await storefrontService.getProductBySlug(req.params.slug);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/categories', async (req, res, next) => {
  try {
    const data = await storefrontService.getCategories();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
