import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createSlug, generateSKU } from '../lib/utils';

interface ProductInput {
  categoryId: string;
  brandId?: string;
  name: string;
  description: string;
  categoryFormData: Record<string, any>;
  bestPrice: number;
  stock: number;
  weight: number;
  hasVariants: boolean;
  media?: { url: string; altText?: string }[];
  variants?: {
    variantFormSchemaId: string;
    variantFormData: Record<string, any>;
    bestPrice: number;
    stock: number;
  }[];
}

export async function listPublisherProducts(publisherId: string, page = 1, limit = 20) {
  const where = { publisherId };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, media: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createProduct(publisherId: string, data: ProductInput) {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new AppError(404, 'NOT_FOUND', 'Category not found');

  const schema = await prisma.categoryFormSchema.findFirst({
    where: { categoryId: data.categoryId, status: 'PUBLISHED' },
  });
  if (!schema) throw new AppError(400, 'VALIDATION_ERROR', 'No published form schema for this category');

  const adminFeeSetting = await prisma.setting.findUnique({ where: { key: 'admin_fee_percentage' } });
  const adminFeePercentage = (adminFeeSetting?.value as any)?.percentage || 10;
  const adminFeeAmount = data.bestPrice * adminFeePercentage / 100;
  const marketplacePrice = data.bestPrice + adminFeeAmount;

  const slug = createSlug(data.name);
  const sku = generateSKU(category.name.substring(0, 3).toUpperCase(), publisherId.substring(0, 3).toUpperCase());

  const product = await prisma.product.create({
    data: {
      publisherId,
      categoryId: data.categoryId,
      brandId: data.brandId,
      categoryFormSchemaId: schema.id,
      name: data.name,
      slug,
      description: data.description,
      categoryFormData: data.categoryFormData,
      bestPrice: data.bestPrice,
      adminFeePercentage,
      adminFeeAmount,
      marketplacePrice,
      sku,
      stock: data.stock,
      weight: data.weight,
      hasVariants: data.hasVariants,
      status: 'DRAFT',
    },
  });

  if (data.hasVariants && data.variants) {
    for (const variant of data.variants) {
      const vAdminFeeAmount = variant.bestPrice * adminFeePercentage / 100;
      const vMarketplacePrice = variant.bestPrice + vAdminFeeAmount;
      const vSku = generateSKU(category.name.substring(0, 3).toUpperCase(), 'VAR');

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          variantFormSchemaId: variant.variantFormSchemaId,
          variantFormData: variant.variantFormData,
          sku: vSku,
          bestPrice: variant.bestPrice,
          adminFeePercentage,
          adminFeeAmount: vAdminFeeAmount,
          marketplacePrice: vMarketplacePrice,
          stock: variant.stock,
          status: 'ACTIVE',
        },
      });
    }
  }

  // Handle media
  if (data.media && data.media.length > 0) {
    await prisma.productMedia.createMany({
      data: data.media.map((m, i) => ({
        productId: product.id,
        url: m.url,
        altText: m.altText || data.name,
        sortOrder: i,
      })),
    });
  }

  return product;
}

export async function getProduct(publisherId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true, media: true, category: true, brand: true },
  });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  if (product.publisherId !== publisherId) throw new AppError(403, 'FORBIDDEN', 'Not your product');
  return product;
}

export async function updateProduct(publisherId: string, productId: string, data: any) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  if (product.publisherId !== publisherId) throw new AppError(403, 'FORBIDDEN', 'Not your product');

  const updateData: any = { ...data };
  if (data.name) updateData.slug = createSlug(data.name);

  // Remove media from updateData - handle separately
  const mediaData = updateData.media;
  delete updateData.media;

  if (data.bestPrice) {
    const adminFeeSetting = await prisma.setting.findUnique({ where: { key: 'admin_fee_percentage' } });
    const adminFeePercentage = (adminFeeSetting?.value as any)?.percentage || 10;
    updateData.adminFeeAmount = data.bestPrice * adminFeePercentage / 100;
    updateData.marketplacePrice = data.bestPrice + updateData.adminFeeAmount;
    updateData.adminFeePercentage = adminFeePercentage;
  }

  const updated = await prisma.product.update({ where: { id: productId }, data: updateData });

  // Handle media update
  if (mediaData && Array.isArray(mediaData)) {
    // Delete existing media
    await prisma.productMedia.deleteMany({ where: { productId } });
    // Create new media
    if (mediaData.length > 0) {
      await prisma.productMedia.createMany({
        data: mediaData.map((m: any, i: number) => ({
          productId,
          url: m.url,
          altText: m.altText || updated.name,
          sortOrder: i,
        })),
      });
    }
  }

  return updated;
}

export async function submitForApproval(publisherId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  if (product.publisherId !== publisherId) throw new AppError(403, 'FORBIDDEN', 'Not your product');
  if (product.status !== 'DRAFT' && product.status !== 'REJECTED') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Only DRAFT or REJECTED products can be submitted');
  }

  return prisma.product.update({
    where: { id: productId },
    data: { status: 'PENDING_APPROVAL' },
  });
}
