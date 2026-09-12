import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePublisherOrders(page = 1, status?: string) {
  return useQuery({
    queryKey: ['publisher', 'orders', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      return api.get<any>(`/publisher/orders?${params.toString()}`);
    },
  });
}

export function usePublisherOrderDetail(id: string) {
  return useQuery({
    queryKey: ['publisher', 'order', id],
    queryFn: () => api.get<any>(`/publisher/orders/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/publisher/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publisher', 'orders'] }),
  });
}

export function useAddAWB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, awbNumber }: { id: string; awbNumber: string }) =>
      api.post<any>(`/publisher/orders/${id}/awb`, { awbNumber }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publisher', 'orders'] }),
  });
}

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => api.get<any>(`/orders?page=${page}`),
  });
}

export function useMyOrderDetail(id: string) {
  return useQuery({
    queryKey: ['myOrder', id],
    queryFn: () => api.get<any>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useShipmentTracking(shipmentId: string) {
  return useQuery({
    queryKey: ['shipmentTracking', shipmentId],
    queryFn: () => api.get<any>(`/shipments/${shipmentId}/tracking`),
    enabled: !!shipmentId,
  });
}
