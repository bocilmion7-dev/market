import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FormField {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  sortOrder: number;
}

interface FormSchema {
  id: string;
  categoryId: string;
  version: number;
  status: string;
  fields: FormField[];
}

export function useCategoryFormSchema(categoryId: string) {
  return useQuery({
    queryKey: ['form-builder', 'category', categoryId],
    queryFn: () => api.get<FormSchema>(`/admin/categories/${categoryId}/form-schema`),
    enabled: !!categoryId,
  });
}

export function useCategoryFormDraft(categoryId: string) {
  return useQuery({
    queryKey: ['form-builder', 'category', categoryId, 'draft'],
    queryFn: () => api.get<FormSchema>(`/admin/categories/${categoryId}/form-schema/draft`),
    enabled: !!categoryId,
  });
}

export function useSaveCategoryFormSchema(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fields: any[]) => api.post(`/admin/categories/${categoryId}/form-schema`, { fields }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form-builder', 'category', categoryId] });
    },
  });
}

export function usePublishCategoryFormSchema(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/admin/categories/${categoryId}/form-schema/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form-builder', 'category', categoryId] });
    },
  });
}

export function useVariantFormSchema(categoryId: string) {
  return useQuery({
    queryKey: ['form-builder', 'variant', categoryId],
    queryFn: () => api.get<FormSchema>(`/admin/categories/${categoryId}/variant-schema`),
    enabled: !!categoryId,
  });
}

export function useSaveVariantFormSchema(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fields: any[]) => api.post(`/admin/categories/${categoryId}/variant-schema`, { fields }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form-builder', 'variant', categoryId] });
    },
  });
}

export function usePublishVariantFormSchema(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/admin/categories/${categoryId}/variant-schema/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['form-builder', 'variant', categoryId] });
    },
  });
}
