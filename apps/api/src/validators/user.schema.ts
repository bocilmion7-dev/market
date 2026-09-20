import { z } from 'zod';

const publisherProfileSchema = z.object({
  address: z.string().optional(),
  provinceId: z.string().optional(),
  provinceName: z.string().optional(),
  cityId: z.string().optional(),
  cityName: z.string().optional(),
  districtId: z.string().optional(),
  districtName: z.string().optional(),
  postalCode: z.string().optional(),
}).optional();

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(150),
  phone: z.string().max(30).optional(),
  role: z.enum(['ADMIN_MAKER', 'PRODUCT_PUBLISHER']),
  publisherProfile: publisherProfileSchema,
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  phone: z.string().max(30).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  publisherProfile: publisherProfileSchema,
});

export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(['ADMIN_MAKER', 'PRODUCT_PUBLISHER'])),
});
