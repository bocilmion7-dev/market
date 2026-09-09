import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function useHomepage() {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: () => api.get<Any>('/homepage'),
  });
}

export function useStoreProducts(params: {
  page?: number;
  categoryId?: string;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['store', 'products', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.categoryId) searchParams.set('categoryId', params.categoryId);
      if (params.search) searchParams.set('search', params.search);
      if (params.sort) searchParams.set('sort', params.sort);
      return api.get<Any>(`/products?${searchParams.toString()}`);
    },
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['store', 'product', slug],
    queryFn: () => api.get<Any>(`/products/${slug}`),
    enabled: !!slug,
  });
}

export function useStoreCategories() {
  return useQuery({
    queryKey: ['store', 'categories'],
    queryFn: () => api.get<Any>('/categories'),
  });
}
