import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, clearGuestId } from '@/lib/api';

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<any[]>('/wishlist'),
    staleTime: 60_000,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.post<any>('/wishlist', { productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.delete<any>(`/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useWishlistCount(productId: string) {
  return useQuery({
    queryKey: ['wishlistCount', productId],
    queryFn: () => api.get<{ count: number }>(`/wishlist/count/${productId}`),
  });
}

export function useMergeWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await api.post<{ merged: number }>('/wishlist/merge');
      clearGuestId();
      return result;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}
