import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProductReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => api.get(`/reviews/product/${productId}?page=${page}`),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; rating: number; comment?: string }) =>
      api.post('/reviews', data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      qc.invalidateQueries({ queryKey: ['store', 'product'] });
    },
  });
}
