import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const CART_KEY = 'marketplace_cart';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  variantId?: string;
  product?: Any;
}

function getCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: () => getCartFromStorage(),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantity: number; variantId?: string }) => {
      const items = getCartFromStorage();
      const existingIndex = items.findIndex(
        (item) => item.productId === data.productId && item.variantId === data.variantId
      );

      if (existingIndex >= 0) {
        items[existingIndex].quantity += data.quantity;
      } else {
        items.push({
          id: `${data.productId}-${data.variantId || 'default'}-${Date.now()}`,
          productId: data.productId,
          quantity: data.quantity,
          variantId: data.variantId,
        });
      }

      saveCartToStorage(items);
      return Promise.resolve(items);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => {
      const items = getCartFromStorage();
      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) {
        items[index].quantity = quantity;
        saveCartToStorage(items);
      }
      return Promise.resolve(items);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const items = getCartFromStorage();
      saveCartToStorage(items.filter((item) => item.id !== id));
      return Promise.resolve();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Any) => {
      return api.post<any>('/orders', {
        shippingAddressId: data.shippingAddressId,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        shippingService: data.shippingService,
        shippingCourier: data.shippingCourier,
        shippingCost: data.shippingCost,
        notes: data.notes,
        items: data.items,
        destinationCityId: data.destinationCityId,
        destinationCityName: data.destinationCityName,
        destinationProvinceName: data.destinationProvinceName,
        destinationDistrictName: data.destinationDistrictName,
        destinationPostalCode: data.destinationPostalCode,
      });
    },
    onSuccess: () => {
      localStorage.removeItem(CART_KEY);
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrders(page = 1) {
  return useQuery<Any>({
    queryKey: ['orders', page],
    queryFn: () => {
      // Orders are still stored via API since they need backend processing
      return Promise.resolve({ data: [], total: 0 });
    },
  });
}
