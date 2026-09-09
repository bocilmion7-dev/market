import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useInitiatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.post<{ token: string; redirect_url: string }>('/payment/initiate', { orderId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useShippingCost() {
  return useMutation({
    mutationFn: (data: { origin: string; destination: string; weight: number; courier: string }) =>
      api.post('/shipping/cost', data),
  });
}
