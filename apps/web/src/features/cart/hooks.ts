import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function useCart() {
  return useQuery<Any[]>({
    queryKey: ['cart'],
    queryFn: () => api.get<Any[]>('/cart'),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantity: number; variantId?: string }) =>
      api.post<Any>('/cart/items', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.patch<Any>(`/cart/items/${id}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<Any>(`/cart/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Any) => api.post<Any>('/orders', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrders(page = 1) {
  return useQuery<Any>({
    queryKey: ['orders', page],
    queryFn: () => api.get<Any>(`/orders?page=${page}`),
  });
}