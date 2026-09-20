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
    mutationFn: ({ id, awbNumber, courier, service }: { id: string; awbNumber: string; courier?: string; service?: string }) =>
      api.post<any>(`/publisher/orders/${id}/awb`, { awbNumber, courier, service }),
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
    staleTime: 30_000,
  });
}

export function useShipmentTracking(shipmentId: string) {
  return useQuery({
    queryKey: ['shipmentTracking', shipmentId],
    queryFn: () => api.get<any>(`/shipments/${shipmentId}/tracking`),
    enabled: !!shipmentId,
    staleTime: 30_000,
  });
}

export function useAdminOrders(page = 1, status?: string, search?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      return api.get<any>(`/admin/orders?${params.toString()}`);
    },
  });
}

export function useAdminOrderDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => api.get<any>(`/admin/orders/${id}`),
    enabled: !!id,
  });
}

export function useAdminUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/admin/orders/${id}/status`, { status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order', variables.id] });
    },
  });
}

export function useAdminUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/admin/orders/${id}/payment-status`, { status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order', variables.id] });
    },
  });
}

export function useAdminAddAWB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, awbNumber, courier, service }: { id: string; awbNumber: string; courier?: string; service?: string }) =>
      api.post<any>(`/admin/orders/${id}/awb`, { awbNumber, courier, service }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order', variables.id] });
    },
  });
}

export interface ShipOrderParams {
  orderId: string;
  origin: {
    contact_name: string;
    contact_phone: string;
    address: string;
    postal_code: number;
  };
  destination: {
    contact_name: string;
    contact_phone: string;
    address: string;
    postal_code: number;
  };
  courier_company: string;
  courier_type: string;
  items: {
    name: string;
    value: number;
    quantity: number;
    weight: number;
    height?: number;
    length?: number;
    width?: number;
  }[];
  order_note?: string;
}

export function useShipOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ShipOrderParams) =>
      api.post<any>('/shipments/ship', params),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['publisher', 'orders'] });
      qc.invalidateQueries({ queryKey: ['publisher', 'order', variables.orderId] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order', variables.orderId] });
    },
  });
}
