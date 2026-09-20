import { Router } from 'express';
import * as rajaongkirService from '../services/rajaongkir.service';
import * as biteshipService from '../services/biteship.service';
import * as settingsService from '../services/settings.service';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router: Router = Router();

async function getEnabledProviders() {
  const providers = await settingsService.getShippingProviders();
  return providers.filter((p) => p.enabled);
}

router.get('/search', async (req, res, next) => {
  try {
    const search = req.query.q as string;
    if (!search || search.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const providers = await getEnabledProviders();
    const results: any[] = [];

    await Promise.all(
      providers.map(async (provider) => {
        try {
          if (provider.id === 'rajaongkir') {
            const data = await rajaongkirService.searchDestinations(search);
            results.push(...data.map((d: any) => ({
              id: d.city_id || d.destination_id || '',
              label: `${d.city_name || ''}, ${d.province_name || ''}`.trim(),
              province_name: d.province_name || '',
              city_name: d.city_name || '',
              district_name: d.district_name || '',
              zip_code: d.postal_code || '',
              province_id: d.province_id || '',
              city_id: d.city_id || '',
              district_id: d.district_id || '',
              provider: 'rajaongkir',
            })));
          } else if (provider.id === 'biteship' && provider.apiKey) {
            const data = await biteshipService.searchDestinations(provider.apiKey, search);
            results.push(...data.map((d: any) => ({
              id: d.id || d.zip_code || '',
              label: d.label || d.city_name || '',
              province_name: d.province_name || '',
              city_name: d.city_name || '',
              district_name: d.district_name || '',
              zip_code: d.zip_code || '',
              province_id: d.province_id || '',
              city_id: d.city_id || '',
              district_id: d.district_id || '',
              provider: 'biteship',
            })));
          }
        } catch (err) {
          console.error(`[Shipping] Search failed for ${provider.id}:`, err);
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

router.post('/cost', validate(z.object({
  origin: z.string(),
  originPostalCode: z.string().optional(),
  destination: z.string(),
  destinationPostalCode: z.string().optional(),
  weight: z.number().positive(),
  courier: z.string(),
  itemValue: z.number().positive().optional().default(0),
})), async (req, res, next) => {
  try {
    const { origin, originPostalCode, destination, destinationPostalCode, weight, courier, itemValue } = req.body;
    const providers = await getEnabledProviders();
    const results: any[] = [];

    await Promise.all(
      providers.map(async (provider) => {
        try {
          if (provider.id === 'rajaongkir') {
            const data = await rajaongkirService.calculateShippingCost(origin, destination, weight, courier);
            results.push(...data.map((d: any) => ({
              courier_code: d.code,
              courier_name: d.name,
              service_code: d.service,
              service_name: d.service,
              price: d.cost,
              duration: d.etd || '',
              description: d.description || '',
              provider: 'rajaongkir',
            })));
          } else if (provider.id === 'biteship' && provider.apiKey && originPostalCode && destinationPostalCode) {
            const courierCodes = courier.split(':').join(',');
            const data = await biteshipService.calculateShippingCost(provider.apiKey, originPostalCode, destinationPostalCode, weight, courierCodes, itemValue);
            results.push(...data.map((d: any) => ({
              courier_code: d.courier_code,
              courier_name: d.courier_name,
              service_code: d.service_code,
              service_name: d.service_name,
              price: d.price,
              duration: d.duration || '',
              description: d.description || '',
              provider: 'biteship',
            })));
          }
        } catch (err) {
          console.error(`[Shipping] Cost calculation failed for ${provider.id}:`, err);
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

router.get('/settings', async (req, res, next) => {
  try {
    const [providers, couriers] = await Promise.all([
      settingsService.getShippingProviders(),
      settingsService.getActiveCouriers(),
    ]);
    const enabledProviderIds = providers.filter((p) => p.enabled).map((p) => p.id);
    const activeCouriers = couriers
      .map((c) => ({ ...c, providers: c.providers.filter((p) => enabledProviderIds.includes(p)) }))
      .filter((c) => c.providers.length > 0);

    res.json({
      success: true,
      data: {
        providers: providers.filter((p) => p.enabled).map((p) => ({ id: p.id, name: p.name })),
        couriers: activeCouriers,
      },
    });
  } catch (err) { next(err); }
});

export default router;
