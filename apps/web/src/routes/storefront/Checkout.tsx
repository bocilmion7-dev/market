import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useCreateOrder } from '@/features/cart/hooks';
import { useInitiatePayment } from '@/features/payment/hooks';
import { Button, Input, Textarea } from '@/components/ui';

export default function Checkout() {
  const navigate = useNavigate();
  const { data: items } = useCart();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const total = items?.reduce((sum: number, item: any) => {
    const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
    return sum + price * item.quantity;
  }, 0) || 0;

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
            {items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                <span className="flex-shrink-0">
                  Rp {((item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice)) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
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
