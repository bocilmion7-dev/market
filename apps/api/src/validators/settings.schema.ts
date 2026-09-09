import { z } from 'zod';

export const updateAdminFeeSchema = z.object({
  percentage: z.number().min(0).max(100),
});
