import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router: Router = Router();

router.get('/', authenticate, authorize('ADMIN_MAKER'), async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.orderStatus = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          publisher: { select: { id: true, fullName: true } },
          shipment: { select: { awb: true, courier: true, service: true } },
          payment: { select: { status: true, amount: true, paymentMethod: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, data: { orders, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, authorize('ADMIN_MAKER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        publisher: { select: { id: true, fullName: true, phone: true, address: true, postalCode: true, cityId: true, districtId: true } },
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        shipment: true,
        payment: true,
      },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

router.patch('/:id/status', authenticate, authorize('ADMIN_MAKER'), validate(z.object({ status: z.string() })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { orderStatus: req.body.status },
    });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

router.patch('/:id/payment-status', authenticate, authorize('ADMIN_MAKER'), validate(z.object({ status: z.string() })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { paymentStatus: req.body.status },
    });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

router.post('/:id/awb', authenticate, authorize('ADMIN_MAKER'), validate(z.object({ awbNumber: z.string().min(1), courier: z.string().optional(), service: z.string().optional() })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string }, include: { shipment: true } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const courier = req.body.courier || order.shippingCourier || 'TBD';
    const service = req.body.service || order.shippingService || 'TBD';

    if (order.shipment) {
      await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: { awb: req.body.awbNumber, courier, service },
      });
    } else {
      const orderWithItems = await prisma.order.findUnique({
        where: { id: req.params.id as string },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      const totalWeightGrams = (orderWithItems?.items as any[])?.reduce((sum: number, item: any) => {
        return sum + (item.product?.weight || 0) * item.quantity;
      }, 0) || 0;

      await prisma.shipment.create({
        data: {
          orderId: order.id,
          publisherId: order.publisherId,
          courier,
          service,
          shippingCost: order.shippingCost,
          weightGram: totalWeightGrams || 1,
          awb: req.body.awbNumber,
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });
      await prisma.order.update({
        where: { id: req.params.id as string },
        data: { orderStatus: 'SHIPPED' },
      });
    }

    res.json({ success: true, data: { id: order.id } });
  } catch (err) { next(err); }
});

export default router;
