import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PaginatedUsers {
  users: Array<{ id: string; email: string; fullName: string; roles: string[]; status: string }>;
  total: number;
  page: number;
  totalPages: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Settings {
  admin_fee_percentage?: { percentage: number };
  site_name?: { name: string };
  site_footer?: { address: string; phone: string; email: string; mapUrl: string; mapEmbedUrl: string; description: string };
  announcement_text?: { text: string };
}

interface PaginatedPendingProducts {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    marketplacePrice: string;
    updatedAt: string;
    publisher?: { fullName: string; businessName?: string };
    category?: { name: string };
    brand?: { name: string };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Users
export function useUsers(page = 1, search = '') {
  return useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => api.get<PaginatedUsers>(`/admin/users?page=${page}&search=${search}`),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/users', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.get<Category[]>('/admin/categories'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/categories', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

// Brands
export function useBrands() {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => api.get<Brand[]>('/admin/brands'),
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/brands', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/brands/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'brands'] }),
  });
}

// Approvals
export function usePendingProducts(page = 1) {
  return useQuery({
    queryKey: ['admin', 'pending-products', page],
    queryFn: () => api.get<PaginatedPendingProducts>(`/admin/pending-products?page=${page}`),
  });
}

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/admin/products/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending-products'] }),
  });
}

export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/products/${id}/reject`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pending-products'] }),
  });
}

// Settings
export function useSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get<Settings>('/admin/settings'),
  });
}

export function useUpdateAdminFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (percentage: number) => api.patch('/admin/settings/admin-fee', { percentage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
}

// Banners
export function useBanners() {
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: () => api.get<any[]>('/admin/banners'),
  });
}

export function useUpdateBanners() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (banners: any[]) => api.put('/admin/banners', { banners }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] }),
  });
}

// Site Settings
export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<{ siteName: string; siteFooter: any; announcementText: string }>('/site-settings'),
  });
}

export function useUpdateSiteName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.put('/admin/settings/site-name', { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-settings'] }),
  });
}

export function useUpdateSiteFooter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (footer: any) => api.put('/admin/settings/site-footer', footer),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-settings'] }),
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.put('/admin/settings/announcement', { text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-settings'] }),
  });
}

// Shipping Settings
export function useShippingProviders() {
  return useQuery({
    queryKey: ['admin', 'shipping-providers'],
    queryFn: () => api.get<any[]>('/admin/settings/shipping-providers'),
  });
}

export function useUpdateShippingProviders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (providers: any[]) => api.put('/admin/settings/shipping-providers', { providers }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'shipping-providers'] }),
  });
}

export function useActiveCouriers() {
  return useQuery({
    queryKey: ['admin', 'active-couriers'],
    queryFn: () => api.get<any[]>('/admin/settings/active-couriers'),
  });
}

export function useUpdateActiveCouriers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (couriers: any[]) => api.put('/admin/settings/active-couriers', { couriers }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'active-couriers'] }),
  });
}

// Midtrans Settings
export function useMidtransSettings() {
  return useQuery({
    queryKey: ['admin', 'midtrans-settings'],
    queryFn: () => api.get<{ serverKey: string; clientKey: string; isProduction: boolean }>('/admin/settings/midtrans'),
  });
}

export function useUpdateMidtransSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { serverKey: string; clientKey: string; isProduction: boolean }) => api.put('/admin/settings/midtrans', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'midtrans-settings'] }),
  });
}

// QRIS Settings
export function useQrisSettings() {
  return useQuery({
    queryKey: ['admin', 'qris-settings'],
    queryFn: () => api.get<{ enabled: boolean; qrImageUrl: string }>('/admin/settings/qris'),
  });
}

export function useUpdateQrisSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { enabled: boolean; qrImageUrl: string }) => api.put('/admin/settings/qris', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'qris-settings'] }),
  });
}

// WhatsApp Settings
export function useWhatsappSettings() {
  return useQuery({
    queryKey: ['admin', 'whatsapp-settings'],
    queryFn: () => api.get<{ phoneNumber: string }>('/admin/settings/whatsapp'),
  });
}

export function useUpdateWhatsappSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phoneNumber: string }) => api.put('/admin/settings/whatsapp', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp-settings'] }),
  });
}

// Public payment settings (for storefront)
export function usePaymentPublicSettings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['payment-public-settings'],
    queryFn: () => api.get<{ qris: { enabled: boolean; qrImageUrl: string }; whatsapp: { phoneNumber: string } }>('/admin/settings/payment-public'),
    enabled: options?.enabled !== false,
    staleTime: 300_000,
  });
}
