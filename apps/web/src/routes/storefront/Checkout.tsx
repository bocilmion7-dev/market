import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useCreateOrder } from '@/features/cart/hooks';
import { useInitiatePayment } from '@/features/payment/hooks';

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold mb-4">Shipping Address</h2>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your full shipping address..."
            className="w-full border rounded-lg px-3 py-2 h-24"
            required
          />

          <h2 className="font-bold mt-6 mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)..."
            className="w-full border rounded-lg px-3 py-2 h-20"
          />
        </div>

        <div>
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg p-4 space-y-3">
            {items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                <span>Rp {((item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice)) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-accent">Rp {total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!shippingAddress || createOrder.isPending || initiatePayment.isPending}
            className="w-full bg-brand-accent text-white py-3 rounded-lg font-semibold mt-4 disabled:opacity-50"
          >
            {initiatePayment.isPending ? 'Redirecting to Payment...' : createOrder.isPending ? 'Creating Order...' : 'Place Order & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
