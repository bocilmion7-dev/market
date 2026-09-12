import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import * as rajaongkirService from '../services/rajaongkir.service';

const router = Router();

router.get('/:id/tracking', authenticate, async (req, res, next) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        tracking: { orderBy: { eventTime: 'asc' } },
        order: { select: { customerId: true, orderNumber: true } },
      },
    });
    if (!shipment) throw new AppError(404, 'NOT_FOUND', 'Shipment not found');

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    const customer = await prisma.customer.findFirst({ where: { email: user.email } });
    if (!customer || shipment.order.customerId !== customer.id) {
      throw new AppError(403, 'FORBIDDEN', 'Not authorized');
    }

    if (shipment.awb && shipment.courier) {
      try {
        const result = await rajaongkirService.trackWaybill(shipment.awb, shipment.courier);

        if (result && result.manifest.length > 0) {
          await prisma.shippingTracking.deleteMany({ where: { shipmentId: shipment.id } });

          await prisma.shippingTracking.createMany({
            data: result.manifest.map((m) => ({
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
              data: {
                status: 'DELIVERED',
                deliveredAt: new Date(),
              },
            });
          }

          const updatedShipment = await prisma.shipment.findUnique({
            where: { id: shipment.id },
            include: { tracking: { orderBy: { eventTime: 'asc' } } },
          });

          return res.json({ success: true, data: updatedShipment });
        }
      } catch (trackingErr) {
        console.error('RajaOngkir tracking failed, returning cached data:', trackingErr);
      }
    }

    res.json({ success: true, data: shipment });
  } catch (err) { next(err); }
});

export default router;
