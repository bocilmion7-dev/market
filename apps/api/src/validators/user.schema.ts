import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(150),
  phone: z.string().max(30).optional(),
  role: z.enum(['ADMIN_MAKER', 'PRODUCT_PUBLISHER']),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  phone: z.string().max(30).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(['ADMIN_MAKER', 'PRODUCT_PUBLISHER'])),
});
