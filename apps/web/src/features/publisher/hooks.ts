import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PaginatedReviews {
  reviews: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedDiscussions {
  discussions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  byDay: Array<{ date: string; count: number; revenue: number }>;
  byProduct: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
  byStatus: Array<{ status: string; count: number; revenue: number }>;
}

export function usePublisherReviews(page = 1, search = '') {
  return useQuery<PaginatedReviews>({
    queryKey: ['publisher', 'reviews', page, search],
    queryFn: () => api.get(`/publisher/reviews?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  });
}

export function usePublisherDiscussions(page = 1, search = '', filter = '') {
  return useQuery<PaginatedDiscussions>({
    queryKey: ['publisher', 'discussions', page, search, filter],
    queryFn: () => api.get(`/publisher/discussions?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${filter ? `&filter=${filter}` : ''}`),
  });
}

export function useReplyDiscussion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) =>
      api.post(`/publisher/discussions/${id}/reply`, { answer }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['publisher', 'discussions'] });
    },
  });
}

export function usePublisherSalesReport(startDate?: string, endDate?: string) {
  return useQuery<SalesReport>({
    queryKey: ['publisher', 'sales-report', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      return api.get(`/publisher/reports/sales?${params.toString()}`);
    },
  });
}
