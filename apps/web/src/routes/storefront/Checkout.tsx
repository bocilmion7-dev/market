import { useState } from 'react';
import { useCart, useCreateOrder } from '@/features/cart/hooks';
import { useInitiatePayment } from '@/features/payment/hooks';
import { Button, Input, Textarea, Skeleton } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  variantId?: string;
}

interface Product {
  id: string;
  name: string;
  marketplacePrice: number;
}

export default function Checkout() {
  const { data: items, isLoading: loadingCart } = useCart();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const cartItems = Array.isArray(items) ? items : [];
  const productIds = cartItems.map((item: CartItem) => item.productId);

  const { data: products = {}, isLoading: loadingProducts } = useQuery<Record<string, Product>>({
    queryKey: ['cartProducts', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};
      const results = await Promise.all(
        productIds.map((id: string) => api.get<Product>(`/products/by-id/${id}`).catch(() => null))
      );
      const map: Record<string, Product> = {};
      results.forEach((p) => { if (p) map[p.id] = p; });
      return map;
    },
    enabled: productIds.length > 0,
  });

  const total = cartItems.reduce((sum: number, item: CartItem) => {
    const product = products[item.productId];
    const price = product ? Number(product.marketplacePrice) : 0;
    return sum + price * item.quantity;
  }, 0);

  if (loadingCart || loadingProducts) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!shippingAddress) return;
    createOrder.mutate({
      shippingAddressId: shippingAddress,
      shippingService: 'REG',
      shippingCourier: 'jne',
      notes,
    }, {
      onSuccess: (data) => {
        const orderId = data.order.id;
        initiatePayment.mutate(orderId, {
          onSuccess: (paymentData) => {
            window.location.href = paymentData.redirect_url;
          },
        });
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <h2 className="font-bold mb-4">Shipping Address</h2>
          <Textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your full shipping address..."
            rows={4}
          />

          <h2 className="font-bold mt-6 mb-4">Notes</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)..."
            rows={3}
          />
        </div>

        <div>
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="bg-[rgb(var(--bg-primary))] p-4 space-y-3">
            {cartItems.map((item: CartItem) => {
              const product = products[item.productId];
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate flex-1 mr-2">{product?.name || 'Produk'} × {item.quantity}</span>
                  <span className="flex-shrink-0">
                    Rp {((product ? Number(product.marketplacePrice) : 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
            <div className="border-t border-[rgb(var(--border))] pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-accent">Rp {total.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={!shippingAddress || createOrder.isPending || initiatePayment.isPending}
            loading={createOrder.isPending || initiatePayment.isPending}
            className="w-full mt-4"
          >
            {initiatePayment.isPending ? 'Redirecting to Payment...' : createOrder.isPending ? 'Creating Order...' : 'Place Order & Pay'}
          </Button>
        </div>
      </div>
    </div>
  );
}
