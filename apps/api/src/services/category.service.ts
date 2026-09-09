import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createSlug } from '../lib/utils';

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(data: { name: string; description?: string }) {
  const slug = createSlug(data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError(400, 'VALIDATION_ERROR', 'Category slug already exists');

  return prisma.category.create({
    data: { name: data.name, slug, description: data.description, status: 'ACTIVE' },
  });
}

export async function updateCategory(id: string, data: { name?: string; description?: string; status?: string }) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError(404, 'NOT_FOUND', 'Category not found');

  const updateData: any = { ...data };
  if (data.name) updateData.slug = createSlug(data.name);

  return prisma.category.update({ where: { id }, data: updateData });
}

export async function deleteCategory(id: string) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError(404, 'NOT_FOUND', 'Category not found');

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cannot delete category with products');
  }

  await prisma.category.delete({ where: { id } });
}
