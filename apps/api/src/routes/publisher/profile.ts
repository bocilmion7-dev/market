import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

const router: Router = Router();

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().min(1, 'Alamat wajib diisi'),
  provinceId: z.string().min(1, 'Provinsi wajib dipilih'),
  provinceName: z.string().optional(),
  cityId: z.string().min(1, 'Kota wajib dipilih'),
  cityName: z.string().optional(),
  districtId: z.string().min(1, 'Kecamatan wajib dipilih'),
  districtName: z.string().optional(),
  postalCode: z.string().min(1, 'Kode pos wajib diisi'),
});

router.get('/', authenticate, authorize('PRODUCT_PUBLISHER'), async (req, res, next) => {
  try {
    const profile = await prisma.publisherProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Publisher profile not found');
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.put('/', authenticate, authorize('PRODUCT_PUBLISHER'), validate(updateProfileSchema), async (req, res, next) => {
  try {
    const { fullName, phone, address, provinceId, provinceName, cityId, cityName, districtId, districtName, postalCode } = req.body;

    const profile = await prisma.publisherProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      throw new AppError(404, 'NOT_FOUND', 'Publisher profile not found');
    }

    const updated = await prisma.publisherProfile.update({
      where: { userId: req.user!.id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
        address,
        provinceId,
        ...(provinceName !== undefined && { provinceName }),
        cityId,
        ...(cityName !== undefined && { cityName }),
        districtId,
        ...(districtName !== undefined && { districtName }),
        postalCode,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

export default router;
