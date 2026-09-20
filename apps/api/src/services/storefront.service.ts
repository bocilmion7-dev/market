import { prisma } from '../lib/prisma';

export async function getHomepage() {
  const [latestProducts, categories, bestsellingProducts, totalPublished] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: { media: true, category: true, publisher: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: { media: true, category: true, publisher: true },
      take: 10,
      orderBy: { orderItems: { _count: 'desc' } },
    }),
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
  ]);

  const randomOffset = Math.max(0, Math.floor(Math.random() * Math.max(0, totalPublished - 40)));
  const randomProducts = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { media: true, category: true, publisher: true },
    skip: randomOffset,
    take: 40,
    orderBy: { createdAt: 'desc' },
  });

  return { latestProducts, categories, bestsellingProducts, randomProducts };
}

export async function listProducts(filters: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where: any = { status: 'PUBLISHED' };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.minPrice || filters.maxPrice) {
    where.marketplacePrice = {};
    if (filters.minPrice) where.marketplacePrice.gte = filters.minPrice;
    if (filters.maxPrice) where.marketplacePrice.lte = filters.maxPrice;
  }

  let orderBy: any = { createdAt: 'desc' };
  if (filters.sort === 'price_asc') orderBy = { marketplacePrice: 'asc' };
  if (filters.sort === 'price_desc') orderBy = { marketplacePrice: 'desc' };
  if (filters.sort === 'newest') orderBy = { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { media: true, category: true, publisher: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      media: true,
      category: true,
      brand: true,
      publisher: true,
      variants: { where: { status: 'ACTIVE' } },
      reviews: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!product || product.status !== 'PUBLISHED') return null;

  const avgRating = await prisma.review.aggregate({
    where: { productId: product.id, status: 'APPROVED' },
    _avg: { rating: true },
    _count: true,
  });

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, status: 'PUBLISHED', id: { not: product.id } },
    include: { media: true },
    take: 4,
  });

  return {
    ...product,
    avgRating: avgRating._avg.rating || 0,
    reviewCount: avgRating._count,
    relatedProducts,
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      media: true,
      category: true,
      brand: true,
      publisher: true,
    },
  });

  if (!product || product.status !== 'PUBLISHED') return null;
  return product;
}
