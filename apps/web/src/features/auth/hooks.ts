import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/stores/auth';
import { useNavigate } from 'react-router-dom';

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      return api.get<User>('/auth/me');
    },
    onSuccess: (data: User) => {
      setUser(data);
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    onSuccess: (data: User) => {
      queryClient.setQueryData(['auth', 'me'], data);
      if (data.roles.includes('ADMIN_MAKER')) {
        navigate('/admin');
      } else if (data.roles.includes('PRODUCT_PUBLISHER')) {
        navigate('/publisher');
      } else {
        navigate('/');
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}
