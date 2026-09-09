import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PublisherProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  bestPrice: number;
  marketplacePrice: number;
  stock: number;
  status: string;
  hasVariants: boolean;
  categoryFormData: Record<string, any>;
  categoryId: string;
  brandId?: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  media?: { id: string; url: string }[];
  variants?: {
    id: string;
    sku: string;
    bestPrice: number;
    marketplacePrice: number;
    stock: number;
    status: string;
    variantFormData: Record<string, any>;
  }[];
}

interface PaginatedProducts {
  products: PublisherProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePublisherProducts(page = 1) {
  return useQuery({
    queryKey: ['publisher', 'products', page],
    queryFn: () => api.get<PaginatedProducts>(`/publisher/products?page=${page}`),
  });
}

export function usePublisherProduct(id: string) {
  return useQuery({
    queryKey: ['publisher', 'product', id],
    queryFn: () => api.get<PublisherProduct>(`/publisher/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<PublisherProduct>('/publisher/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publisher', 'products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch<PublisherProduct>(`/publisher/products/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publisher', 'products'] }),
  });
}

export function useSubmitProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<PublisherProduct>(`/publisher/products/${id}/submit`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publisher', 'products'] }),
  });
}
