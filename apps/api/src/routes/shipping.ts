import { Router } from 'express';
import * as rajaongkirService from '../services/rajaongkir.service';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/provinces', async (req, res, next) => {
  try {
    const data = await rajaongkirService.getProvinces();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/cities', async (req, res, next) => {
  try {
    const provinceId = req.query.provinceId as string;
    const data = await rajaongkirService.getCities(provinceId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/cost', validate(z.object({
  origin: z.string(),
  destination: z.string(),
  weight: z.number().positive(),
  courier: z.string(),
})), async (req, res, next) => {
  try {
    const data = await rajaongkirService.calculateShippingCost(req.body.origin, req.body.destination, req.body.weight, req.body.courier);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
