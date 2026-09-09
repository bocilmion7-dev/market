import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
