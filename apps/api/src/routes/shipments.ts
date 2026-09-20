import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import * as rajaongkirService from '../services/rajaongkir.service';
import * as biteshipService from '../services/biteship.service';
import { getShippingProviders } from '../services/settings.service';
import { z } from 'zod';

const router: Router = Router();

async function getActiveProvider() {
  const providers = await getShippingProviders();
  const rajaongkir = providers.find(p => p.id === 'rajaongkir' && p.enabled);
  const biteship = providers.find(p => p.id === 'biteship' && p.enabled);
  if (rajaongkir) return { id: 'rajaongkir', apiKey: rajaongkir.apiKey };
  if (biteship) return { id: 'biteship', apiKey: biteship.apiKey };
  return { id: 'rajaongkir', apiKey: '' };
}

const shipOrderSchema = z.object({
  orderId: z.string().min(1),
  origin: z.object({
    contact_name: z.string().min(1).default('Publisher'),
    contact_phone: z.string().default('080000000000'),
    address: z.string().min(1),
    postal_code: z.number(),
  }),
  destination: z.object({
    contact_name: z.string().min(1).default('Customer'),
    contact_phone: z.string().default('080000000000'),
    address: z.string().min(1),
    postal_code: z.number(),
  }),
  courier_company: z.string().min(1),
  courier_type: z.string().min(1),
  items: z.array(z.object({
    name: z.string().min(1),
    value: z.number().min(1),
    quantity: z.number().min(1),
    weight: z.number().min(1),
    height: z.number().optional(),
    length: z.number().optional(),
    width: z.number().optional(),
  })).min(1),
  order_note: z.string().optional(),
});

router.post('/ship', authenticate, validate(shipOrderSchema), async (req, res, next) => {
  try {
    const provider = await getActiveProvider();
    if (provider.id !== 'biteship' || !provider.apiKey) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Biteship is not the active shipping provider');
    }

    const body = req.body;

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { shipment: true },
    });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');
    if (order.shipment?.awb) throw new AppError(400, 'VALIDATION_ERROR', 'Order already has AWB');

    const result = await biteshipService.createOrder(provider.apiKey, {
      origin_contact_name: body.origin.contact_name,
      origin_contact_phone: body.origin.contact_phone,
      origin_address: body.origin.address,
      origin_postal_code: body.origin.postal_code,
      destination_contact_name: body.destination.contact_name,
      destination_contact_phone: body.destination.contact_phone,
      destination_address: body.destination.address,
      destination_postal_code: body.destination.postal_code,
      courier_company: body.courier_company.toLowerCase(),
      courier_type: body.courier_type.toLowerCase(),
      delivery_type: 'now',
      items: body.items,
      reference_id: order.orderNumber,
      order_note: body.order_note,
    });

    if (order.shipment) {
      await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: {
          awb: result.courier.waybill_id,
          courier: result.courier.company,
          service: body.courier_type,
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });
    } else {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          publisherId: order.publisherId,
          courier: result.courier.company,
          service: body.courier_type,
          shippingCost: order.shippingCost,
          weightGram: body.items.reduce((sum: number, item: any) => sum + item.weight * item.quantity, 0),
          awb: result.courier.waybill_id,
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'SHIPPED' },
    });

    res.json({
      success: true,
      data: {
        waybill_id: result.courier.waybill_id,
        tracking_id: result.courier.tracking_id,
        courier: result.courier.company,
        status: result.status,
        price: result.price,
      },
    });
  } catch (err) { next(err); }
});

router.post('/track', async (req, res, next) => {
  try {
    const { awb, courier } = req.body;
    if (!awb || !courier) return res.status(400).json({ success: false, message: 'AWB and courier are required' });

    const provider = await getActiveProvider();

    if (provider.id === 'biteship' && provider.apiKey) {
      const result = await biteshipService.trackWaybill(provider.apiKey, awb, courier);
      const manifest = (result.events || []).map((e: any) => ({
        manifest_description: e.note || e.status,
        manifest_date: e.created_at?.split('T')[0] || '',
        manifest_time: e.created_at?.split('T')[1]?.split('.')[0] || '',
        city_name: e.warehouse_name || '',
      }));
      return res.json({ success: true, data: { delivered: result.delivered, manifest } });
    }

    const result = await rajaongkirService.trackWaybill(awb, courier);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/:id/tracking', authenticate, async (req, res, next) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id as string },
      include: {
        tracking: { orderBy: { eventTime: 'asc' } },
        order: { select: { customerId: true, orderNumber: true } },
      },
    });
    if (!shipment) throw new AppError(404, 'NOT_FOUND', 'Shipment not found');

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    const customer = await prisma.customer.findFirst({ where: { email: user.email } });
    if (!customer || (shipment as any).order.customerId !== customer.id) {
      throw new AppError(403, 'FORBIDDEN', 'Not authorized');
    }

    if (shipment.awb && shipment.courier) {
      try {
        const provider = await getActiveProvider();
        let result: any = null;

        if (provider.id === 'biteship' && provider.apiKey) {
          const biteshipResult = await biteshipService.trackWaybill(provider.apiKey, shipment.awb, shipment.courier);
          const manifest = (biteshipResult.events || []).map((e: any) => ({
            manifest_description: e.note || e.status,
            manifest_date: e.created_at?.split('T')[0] || '',
            manifest_time: e.created_at?.split('T')[1]?.split('.')[0] || '',
            city_name: e.warehouse_name || '',
          }));
          result = { delivered: biteshipResult.delivered, manifest };
        } else {
          result = await rajaongkirService.trackWaybill(shipment.awb, shipment.courier);
        }

        if (result && result.manifest.length > 0) {
          await prisma.shippingTracking.deleteMany({ where: { shipmentId: shipment.id } });

          await prisma.shippingTracking.createMany({
            data: result.manifest.map((m: any) => ({
              shipmentId: shipment.id,
              status: m.manifest_description,
              description: m.manifest_description,
              location: m.city_name,
              eventTime: new Date(`${m.manifest_date}T${m.manifest_time}`),
            })),
          });

          if (result.delivered) {
            await prisma.shipment.update({
              where: { id: shipment.id },
              data: { status: 'DELIVERED', deliveredAt: new Date() },
            });
          }

          const updatedShipment = await prisma.shipment.findUnique({
            where: { id: shipment.id },
            include: { tracking: { orderBy: { eventTime: 'asc' } } },
          });

          return res.json({ success: true, data: updatedShipment });
        }
      } catch (trackingErr) {
        console.error('Tracking API failed, returning cached data:', trackingErr);
      }
    }

    res.json({ success: true, data: shipment });
  } catch (err) { next(err); }
});

export default router;
