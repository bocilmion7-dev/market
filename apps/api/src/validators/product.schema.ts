import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  categoryFormData: z.record(z.any()),
  bestPrice: z.number().positive(),
  stock: z.number().int().min(0),
  weight: z.number().int().min(1, 'Berat produk wajib diisi (minimal 1 gram)'),
  hasVariants: z.boolean().default(false),
  variants: z.array(z.object({
    variantFormSchemaId: z.string().uuid(),
    variantFormData: z.record(z.any()),
    bestPrice: z.number().positive(),
    stock: z.number().int().min(0),
  })).optional(),
}).refine(data => data.hasVariants ? (data.variants && data.variants.length > 0) : true, {
  message: 'Variants required when hasVariants is true',
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  categoryFormData: z.record(z.any()).optional(),
  bestPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  weight: z.number().int().min(1, 'Berat produk wajib diisi (minimal 1 gram)').optional(),
  brandId: z.string().uuid().optional(),
});
