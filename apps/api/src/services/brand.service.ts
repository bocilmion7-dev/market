import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createSlug } from '../lib/utils';

export async function listBrands() {
  return prisma.brand.findMany({ orderBy: { name: 'asc' } });
}

export async function createBrand(data: { name: string }) {
  const slug = createSlug(data.name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) throw new AppError(400, 'VALIDATION_ERROR', 'Brand slug already exists');

  return prisma.brand.create({ data: { name: data.name, slug, status: 'ACTIVE' } });
}

export async function updateBrand(id: string, data: { name?: string; status?: string }) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError(404, 'NOT_FOUND', 'Brand not found');

  const updateData: any = { ...data };
  if (data.name) updateData.slug = createSlug(data.name);

  return prisma.brand.update({ where: { id }, data: updateData });
}

export async function deleteBrand(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new AppError(404, 'NOT_FOUND', 'Brand not found');

  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cannot delete brand with products');
  }

  await prisma.brand.delete({ where: { id } });
}
