import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard'),
  });
}

export function useSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'sales', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      return api.get(`/admin/sales?${params.toString()}`);
    },
  });
}

export function usePublisherReport() {
  return useQuery({
    queryKey: ['admin', 'publisher-report'],
    queryFn: () => api.get('/admin/publishers'),
  });
}

export function useAuditLogs(page = 1, filters?: { action?: string; entityType?: string }) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page, filters],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (filters?.action) params.set('action', filters.action);
      if (filters?.entityType) params.set('entityType', filters.entityType);
      return api.get(`/admin/audit-logs?${params.toString()}`);
    },
  });
}
