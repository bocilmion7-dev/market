import { useState } from 'react';
import { useCart, useCreateOrder } from '@/features/cart/hooks';
import { useInitiatePayment, useShippingCost } from '@/features/payment/hooks';
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
  weight?: number;
}

const COURIERS = [
  { value: 'jne', label: 'JNE' },
  { value: 'jnt', label: 'J&T' },
  { value: 'sicepat', label: 'SiCepat' },
  { value: 'antine', label: 'AnterAja' },
];

const ORIGIN_CITY = '501';

export default function Checkout() {
  const { data: items, isLoading: loadingCart } = useCart();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();
  const shippingCostMutation = useShippingCost();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [courier, setCourier] = useState('jne');
  const [destinationCity, setDestinationCity] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

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

  const totalWeight = cartItems.reduce((sum: number, item: CartItem) => {
    const product = products[item.productId];
    return sum + (product?.weight || 500) * item.quantity;
  }, 0);

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
    const product = products[item.productId];
    const price = product ? Number(product.marketplacePrice) : 0;
    return sum + price * item.quantity;
  }, 0);

  const grandTotal = subtotal + shippingCost;

  const { data: cityResults = [] } = useQuery<any[]>({
    queryKey: ['citySearch', destinationCity],
    queryFn: async () => {
      if (destinationCity.length < 2) return [];
      const data = await api.get<any>(`/shipping/cities`);
      return data.filter((c: any) =>
        c.city_name.toLowerCase().includes(destinationCity.toLowerCase())
      ).slice(0, 5);
    },
    enabled: destinationCity.length >= 2,
  });

  const handleCalculateShipping = () => {
    if (!selectedCityId) return;
    shippingCostMutation.mutate(
      { origin: ORIGIN_CITY, destination: selectedCityId, weight: totalWeight, courier },
      {
        onSuccess: (data: any) => {
          const costs = data?.cost || data?.[0]?.cost || [];
          if (costs.length > 0) {
            setShippingCost(costs[0].value);
            setSelectedService(costs[0].service || courier.toUpperCase());
          }
        },
      }
    );
  };

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
    createOrder.mutate(
      {
        shippingAddressId: shippingAddress,
        shippingService: selectedService || 'REG',
        shippingCourier: courier,
        notes,
      },
      {
        onSuccess: (data) => {
          const orderId = data.order.id;
          initiatePayment.mutate(orderId, {
            onSuccess: (paymentData) => {
              window.location.href = paymentData.redirect_url;
            },
          });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <h2 className="font-bold mb-4">Alamat Pengiriman</h2>
          <Textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Masukkan alamat lengkap pengiriman..."
            rows={4}
          />

          <h2 className="font-bold mt-6 mb-4">Kota Tujuan</h2>
          <div className="relative">
            <Input
              value={destinationCity}
              onChange={(e) => {
                setDestinationCity(e.target.value);
                setSelectedCityId('');
                setShippingCost(0);
              }}
              placeholder="Cari kota tujuan..."
            />
            {cityResults.length > 0 && !selectedCityId && (
              <div className="absolute z-10 w-full bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm mt-1 shadow-lg max-h-48 overflow-y-auto">
                {cityResults.map((city: any) => (
                  <button
                    key={city.city_id}
                    onClick={() => {
                      setDestinationCity(city.city_name);
                      setSelectedCityId(city.city_id);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border))] last:border-0"
                  >
                    {city.city_name}, {city.province}
                  </button>
                ))}
              </div>
            )}
          </div>

          <h2 className="font-bold mt-6 mb-4">Kurir</h2>
          <div className="flex gap-2 flex-wrap">
            {COURIERS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setCourier(c.value);
                  setShippingCost(0);
                  setSelectedService('');
                }}
                className={`px-4 py-2 text-sm rounded-sm border ${
                  courier === c.value
                    ? 'bg-brand-accent text-white border-brand-accent'
                    : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <Button
            onClick={handleCalculateShipping}
            disabled={!selectedCityId || shippingCostMutation.isPending}
            loading={shippingCostMutation.isPending}
            variant="outline"
            className="w-full mt-4"
          >
            {shippingCostMutation.isPending ? 'Menghitung...' : 'Hitung Ongkos Kirim'}
          </Button>

          <h2 className="font-bold mt-6 mb-4">Catatan</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan pesanan (opsional)..."
            rows={3}
          />
        </div>

        <div>
          <h2 className="font-bold mb-4">Ringkasan Pesanan</h2>
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
            <div className="border-t border-[rgb(var(--border))] pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--text-muted))]">Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--text-muted))]">Ongkos Kirim ({COURIERS.find((c) => c.value === courier)?.label}{selectedService ? ` ${selectedService}` : ''})</span>
                <span>{shippingCost > 0 ? `Rp ${shippingCost.toLocaleString()}` : '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--text-muted))]">Estimasi Berat</span>
                <span>{totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(1)} kg` : `${totalWeight} g`}</span>
              </div>
              <div className="border-t border-[rgb(var(--border))] pt-2 flex justify-between font-bold">
                <span>Grand Total</span>
                <span className="text-brand-accent">Rp {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={!shippingAddress || createOrder.isPending || initiatePayment.isPending}
            loading={createOrder.isPending || initiatePayment.isPending}
            className="w-full mt-4"
          >
            {initiatePayment.isPending
              ? 'Redirecting to Payment...'
              : createOrder.isPending
              ? 'Creating Order...'
              : 'Bayar Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  );
}
