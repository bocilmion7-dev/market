import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalPublishers: number;
  pendingApprovals: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    grandTotal: string | number;
    orderStatus: string;
    createdAt: string;
    customer?: { fullName: string };
  }>;
}

interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  byDay: Array<{ date: string; count: number; revenue: number }>;
}

interface PublisherReportItem {
  publisherId: string;
  publisherName: string;
  orderCount: number;
  totalRevenue: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
  actor?: { email: string };
  actorUserId: string;
}

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  totalPages: number;
  total: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard'),
  });
}

export function useSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'sales', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      return api.get<SalesReport>(`/admin/sales?${params.toString()}`);
    },
  });
}

export function usePublisherReport() {
  return useQuery({
    queryKey: ['admin', 'publisher-report'],
    queryFn: () => api.get<PublisherReportItem[]>('/admin/publishers'),
  });
}

export function useAuditLogs(page = 1, filters?: { action?: string; entityType?: string }) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page, filters],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (filters?.action) params.set('action', filters.action);
      if (filters?.entityType) params.set('entityType', filters.entityType);
      return api.get<AuditLogsResponse>(`/admin/audit-logs?${params.toString()}`);
    },
  });
}
