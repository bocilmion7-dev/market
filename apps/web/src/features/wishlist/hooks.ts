import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const WISHLIST_KEY = 'marketplace_wishlist';

function getWishlistFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlistToStorage(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      try {
        const data = await api.get<any[]>('/wishlist');
        const ids = data.map((item: any) => item.productId);
        saveWishlistToStorage(ids);
        return data;
      } catch {
        const ids = getWishlistFromStorage();
        return ids.map((id: string) => ({ productId: id }));
      }
    },
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const ids = getWishlistFromStorage();
      if (!ids.includes(productId)) {
        ids.push(productId);
        saveWishlistToStorage(ids);
      }
      try {
        await api.post('/wishlist', { productId });
      } catch {}
      return { productId };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const ids = getWishlistFromStorage();
      saveWishlistToStorage(ids.filter((id) => id !== productId));
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch {}
      return { productId };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useWishlistCount(productId: string) {
  return useQuery({
    queryKey: ['wishlistCount', productId],
    queryFn: () => api.get<{ count: number }>(`/wishlist/count/${productId}`),
  });
}
