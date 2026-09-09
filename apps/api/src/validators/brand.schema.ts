import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1).max(150),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
