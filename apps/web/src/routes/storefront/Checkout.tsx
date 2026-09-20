import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useCreateOrder } from '@/features/cart/hooks';
import { useInitiatePayment } from '@/features/payment/hooks';
import { usePaymentPublicSettings } from '@/features/admin/hooks';
import { Button, Input, Textarea, Skeleton, PageTransition } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, ChevronRight, MapPin, Truck, CreditCard } from 'lucide-react';

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
  publisher?: {
    postalCode?: string;
    cityId?: string;
    address?: string;
  };
}

interface ShippingSettings {
  providers: { id: string; name: string }[];
  couriers: { code: string; name: string; providers: string[] }[];
}

interface SelectedDestination {
  id: string;
  label: string;
  zip_code: string;
  city_name?: string;
  district_name?: string;
  province_name?: string;
  city_id?: string;
  district_id?: string;
  province_id?: string;
}

const steps = [
  { id: 1, label: 'Alamat', icon: MapPin },
  { id: 2, label: 'Pengiriman', icon: Truck },
  { id: 3, label: 'Pembayaran', icon: CreditCard },
];

function StepIndicator({ currentStep, completedSteps }: { currentStep: number; completedSteps: number[] }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-brand-accent text-white ring-4 ring-brand-accent/20'
                    : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-muted))]'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-brand-accent' : 'text-[rgb(var(--text-muted))]'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 md:w-24 h-0.5 mx-2 mt-[-16px] transition-colors ${
                isCompleted ? 'bg-green-500' : 'bg-[rgb(var(--bg-tertiary))]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { data: items, isLoading: loadingCart } = useCart();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();
  const { data: paymentSettings } = usePaymentPublicSettings();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [shippingAddress, setShippingAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [courier, setCourier] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<SelectedDestination | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [expandedCourier, setExpandedCourier] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'qris'>('midtrans');

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

  const publisherPostalCode = (() => {
    for (const item of cartItems) {
      const product = products[item.productId];
      if (product?.publisher?.postalCode) return product.publisher.postalCode;
    }
    return null;
  })();

  const publisherCityId = (() => {
    for (const item of cartItems) {
      const product = products[item.productId];
      if (product?.publisher?.cityId) return product.publisher.cityId;
    }
    return null;
  })();

  const { data: shippingSettings, isLoading: loadingSettings } = useQuery<ShippingSettings>({
    queryKey: ['shippingSettings'],
    queryFn: () => api.get('/shipping/settings'),
  });

  const missingWeightProducts = cartItems.filter((item) => {
    const product = products[item.productId];
    return !product || !product.weight || product.weight <= 0;
  });

  const totalWeight = cartItems.reduce((sum: number, item: CartItem) => {
    const product = products[item.productId];
    return sum + (product?.weight || 0) * item.quantity;
  }, 0);

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
    const product = products[item.productId];
    const price = product ? Number(product.marketplacePrice) : 0;
    return sum + price * item.quantity;
  }, 0);

  const grandTotal = subtotal + shippingCost;

  const activeCouriers = shippingSettings?.couriers || [];
  const activeCourierCodes = activeCouriers.map((c) => c.code);
  const allCourierValues = activeCourierCodes.join(':');

  const { data: cityResults = [] } = useQuery<any[]>({
    queryKey: ['citySearch', destinationCity],
    queryFn: async () => {
      if (destinationCity.length < 2) return [];
      const data = await api.get<any>(`/shipping/search?q=${encodeURIComponent(destinationCity)}`);
      return Array.isArray(data) ? data.slice(0, 8) : [];
    },
    enabled: destinationCity.length >= 2,
  });

  const { data: allCosts = [], isLoading: loadingCosts } = useQuery<any[]>({
    queryKey: ['allShippingCosts', selectedDestination?.id, totalWeight, publisherPostalCode, publisherCityId],
    queryFn: async () => {
      if (!selectedDestination || !publisherPostalCode) return [];
      return api.post('/shipping/cost', {
        origin: publisherCityId || publisherPostalCode,
        originPostalCode: publisherPostalCode,
        destination: String(selectedDestination.id),
        destinationPostalCode: selectedDestination.zip_code || '',
        weight: totalWeight,
        courier: allCourierValues,
        itemValue: subtotal,
      });
    },
    enabled: !!selectedDestination && !!publisherPostalCode && totalWeight > 0 && missingWeightProducts.length === 0 && allCourierValues.length > 0,
  });

  const getServicesForCourier = (courierCode: string) => {
    return allCosts.filter((c: any) => c.courier_code === courierCode || c.code === courierCode);
  };

  const handleSelectCity = (city: any) => {
    setDestinationCity(city.label);
    setSelectedDestination(city);
    setShippingCost(0);
    setSelectedService('');
    setCourier('');
    setExpandedCourier('');
  };

  const handleToggleCourier = (courierCode: string) => {
    setExpandedCourier(expandedCourier === courierCode ? '' : courierCode);
  };

  const handleSelectService = (cost: any) => {
    setCourier(cost.courier_code || cost.code);
    setSelectedService(cost.service_code || cost.service);
    setShippingCost(cost.price || cost.cost);
    setExpandedCourier('');
  };

  const canProceedToStep2 = () => {
    return recipientName.trim() && recipientPhone.trim() && shippingAddress.trim();
  };

  const canProceedToStep3 = () => {
    return selectedDestination && courier && selectedService;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCompletedSteps([...completedSteps, 1]);
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      setCompletedSteps([...completedSteps, 2]);
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCompletedSteps(completedSteps.filter(s => s < currentStep));
    }
  };

  if (loadingCart || loadingProducts || loadingSettings) {
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

  const qrisEnabled = paymentSettings?.qris?.enabled;

  const handleCheckout = () => {
    if (!shippingAddress || !recipientName || !recipientPhone || !courier || !selectedService || !selectedDestination) return;
    if (missingWeightProducts.length > 0) return;
    const orderItems = cartItems.map((item: CartItem) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
    }));
    createOrder.mutate(
      {
        shippingAddressId: shippingAddress,
        recipientName,
        recipientPhone,
        shippingService: selectedService,
        shippingCourier: courier,
        shippingCost: shippingCost || 0,
        notes: paymentMethod === 'qris' ? `PAYMENT:QRIS${notes ? '\n' + notes : ''}` : notes,
        items: orderItems,
        destinationCityId: selectedDestination.city_id || selectedDestination.id,
        destinationCityName: selectedDestination.city_name || '',
        destinationProvinceName: selectedDestination.province_name || '',
        destinationDistrictName: selectedDestination.district_name || '',
        destinationPostalCode: selectedDestination.zip_code || '',
      },
      {
        onSuccess: (order) => {
          if (paymentMethod === 'qris') {
            navigate(`/orders/${order.id}`);
          } else {
            initiatePayment.mutate(order.id, {
              onSuccess: (paymentData) => {
                if (paymentData?.redirect_url) {
                  window.location.href = paymentData.redirect_url;
                } else {
                  alert('Payment gateway error: no redirect URL received');
                }
              },
              onError: (err: any) => {
                alert('Payment initiation failed: ' + (err.message || 'Unknown error'));
              },
            });
          }
        },
        onError: (err: any) => {
          alert('Order creation failed: ' + (err.message || 'Unknown error'));
        },
      }
    );
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl md:text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-sm text-[rgb(var(--text-muted))] mb-6">{cartItems.length} item dalam keranjang</p>

        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-accent" />
                  Alamat Pengiriman
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Penerima</label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nama lengkap penerima..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. HP Penerima</label>
                  <Input
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="08123456789"
                    type="tel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap pengiriman..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleNextStep} disabled={!canProceedToStep2()}>
                    Lanjut ke Pengiriman <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-accent" />
                  Pilih Pengiriman
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Kota Tujuan</label>
                  <div className="relative">
                    <Input
                      value={destinationCity}
                      onChange={(e) => {
                        setDestinationCity(e.target.value);
                        setSelectedDestination(null);
                        setShippingCost(0);
                        setSelectedService('');
                        setCourier('');
                        setExpandedCourier('');
                      }}
                      placeholder="Cari kota tujuan..."
                    />
                    {cityResults.length > 0 && !selectedDestination && (
                      <div className="absolute z-10 w-full bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm mt-1 shadow-lg max-h-48 overflow-y-auto">
                        {cityResults.map((city: any, idx: number) => (
                          <button
                            key={`${city.id}-${idx}`}
                            onClick={() => handleSelectCity(city)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border))] last:border-0"
                          >
                            {city.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {missingWeightProducts.length > 0 && (
                  <p className="text-sm text-semantic-error">Beberapa produk belum memiliki data berat. Hubungi penjual untuk mengatur berat produk.</p>
                )}
                {!publisherPostalCode && (
                  <p className="text-sm text-semantic-error">Penjual belum mengatur alamat pengiriman. Hubungi admin.</p>
                )}
                {!selectedDestination && publisherPostalCode && (
                  <p className="text-sm text-[rgb(var(--text-muted))]">Pilih kota tujuan terlebih dahulu</p>
                )}
                {selectedDestination && loadingCosts && (
                  <p className="text-sm text-[rgb(var(--text-muted))]">Menghitung ongkos kirim...</p>
                )}
                {selectedDestination && !loadingCosts && activeCouriers.length === 0 && (
                  <p className="text-sm text-semantic-error">Tidak ada kurir aktif. Hubungi admin.</p>
                )}
                {selectedDestination && !loadingCosts && activeCouriers.length > 0 && (
                  <div className="space-y-2">
                    {activeCouriers.map((c) => {
                      const services = getServicesForCourier(c.code);
                      const isExpanded = expandedCourier === c.code;
                      const hasSelected = courier === c.code;
                      return (
                        <div key={c.code}>
                          <button
                            onClick={() => handleToggleCourier(c.code)}
                            disabled={services.length === 0}
                            className={`w-full px-4 py-2.5 text-sm rounded-sm border text-left flex items-center justify-between ${
                              hasSelected
                                ? 'bg-brand-accent text-white border-brand-accent'
                                : services.length === 0
                                ? 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] opacity-40 cursor-not-allowed'
                                : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent'
                            }`}
                          >
                            <span className="font-medium">{c.name}</span>
                            {services.length > 0 && (
                              <span className="text-xs">
                                {hasSelected
                                  ? `Rp ${(shippingCost).toLocaleString()} (${selectedService})`
                                  : `${services.length} layanan`}
                              </span>
                            )}
                            {services.length === 0 && (
                              <span className="text-xs opacity-60">Tidak tersedia</span>
                            )}
                          </button>
                          {isExpanded && services.length > 0 && (
                            <div className="border border-t-0 border-[rgb(var(--border))] rounded-b-sm bg-[rgb(var(--bg-secondary))]">
                              {services.map((s: any, i: number) => (
                                <button
                                  key={`${s.courier_code || s.code}-${s.service_code || s.service}-${i}`}
                                  onClick={() => handleSelectService(s)}
                                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-[rgb(var(--bg-primary))] ${
                                    courier === (s.courier_code || s.code) && selectedService === (s.service_code || s.service)
                                      ? 'bg-brand-accent/10'
                                      : ''
                                  } ${i < services.length - 1 ? 'border-b border-[rgb(var(--border))]' : ''}`}
                                >
                                  <div>
                                    <span className="font-medium">{s.service_name || s.service}</span>
                                    <span className="text-xs text-[rgb(var(--text-muted))] ml-2">{s.description}</span>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-4">
                                    <span className="font-medium">Rp {(s.price || s.cost).toLocaleString()}</span>
                                    {(s.duration || s.etd) && (
                                      <span className="block text-xs text-[rgb(var(--text-muted))]">~{s.duration || s.etd}</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedDestination && !loadingCosts && !courier && activeCouriers.length > 0 && (
                  <p className="text-sm text-semantic-error mt-2">Pilih kurir dan layanan pengiriman</p>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Catatan (Opsional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan pesanan..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Kembali
                  </Button>
                  <Button onClick={handleNextStep} disabled={!canProceedToStep3()}>
                    Lanjut ke Pembayaran <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-accent" />
                  Metode Pembayaran
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setPaymentMethod('midtrans')}
                    className={`w-full px-4 py-3 text-sm rounded-sm border text-left flex items-center gap-3 ${
                      paymentMethod === 'midtrans'
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent'
                    }`}
                  >
                    <span className="font-medium">Midtrans</span>
                    <span className="text-xs opacity-75">VA, Credit Card, E-Wallet</span>
                  </button>
                  {qrisEnabled && (
                    <button
                      onClick={() => setPaymentMethod('qris')}
                      className={`w-full px-4 py-3 text-sm rounded-sm border text-left flex items-center gap-3 ${
                        paymentMethod === 'qris'
                          ? 'bg-brand-accent text-white border-brand-accent'
                          : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent'
                      }`}
                    >
                      <span className="font-medium">QRIS</span>
                      <span className="text-xs opacity-75">Transfer Manual</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={createOrder.isPending || initiatePayment.isPending}
                    loading={createOrder.isPending || initiatePayment.isPending}
                  >
                    {initiatePayment.isPending
                      ? 'Redirecting to Payment...'
                      : createOrder.isPending
                      ? 'Creating Order...'
                      : paymentMethod === 'qris'
                      ? 'Buat Pesanan'
                      : 'Bayar Sekarang'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-[rgb(var(--bg-primary))] p-4 rounded-sm border border-[rgb(var(--border))] sticky top-24">
              <h3 className="font-bold mb-3">Ringkasan Pesanan</h3>
              <div className="space-y-3">
                {cartItems.map((item: CartItem) => {
                  const product = products[item.productId];
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{product?.name || 'Produk'} x {item.quantity}</span>
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
                    <span className="text-[rgb(var(--text-muted))]">
                      Ongkos Kirim
                      {selectedService && ` (${courier.toUpperCase()} ${selectedService})`}
                    </span>
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
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
