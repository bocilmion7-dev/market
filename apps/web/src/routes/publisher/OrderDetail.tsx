import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublisherOrderDetail, useUpdateOrderStatus, useAddAWB } from '@/features/orders/hooks';

export default function PublisherOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = usePublisherOrderDetail(id || '');
  const updateStatus = useUpdateOrderStatus();
  const addAWB = useAddAWB();
  const [awbNumber, setAwbNumber] = useState('');

  const handleAddAWB = () => {
    if (!awbNumber || !id) return;
    addAWB.mutate({ id, awbNumber }, { onSuccess: () => setAwbNumber('') });
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateStatus.mutate({ id: id!, status: newStatus });
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (!order) return <div className="p-6 text-center text-gray-500">Order not found</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/publisher/orders" className="text-sm text-gray-500 hover:text-brand-accent">&larr; Back to Orders</Link>
          <h1 className="text-2xl font-bold mt-2">Order {order.orderNumber}</h1>
        </div>
        <span className={`px-3 py-1 text-sm ${
          order.orderStatus === 'PAID' ? 'bg-blue-100 text-blue-700' :
          order.orderStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
          order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
          order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>{order.orderStatus}</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">Customer</h3>
            <p className="text-sm">{order.customerName || order.customer?.name}</p>
            <p className="text-sm text-gray-500">{order.customerEmail || order.customer?.email}</p>
          </div>

          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">Items</h3>
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                <span>{item.productNameSnapshot} &times; {item.quantity}</span>
                <span>Rp {Number(item.subtotalMarketplacePrice).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">Shipping</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress?.fullAddress || '—'}</p>
            {order.shipment && (
              <p className="text-sm text-gray-500 mt-2">Courier: {order.shipment.courier} — {order.shipment.service}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">AWB Number</h3>
            {order.shipment?.awb ? (
              <p className="text-lg font-mono text-brand-accent">{order.shipment.awb}</p>
            ) : order.orderStatus === 'PAID' || order.orderStatus === 'PROCESSING' ? (
              <div className="flex gap-2">
                <input value={awbNumber} onChange={(e) => setAwbNumber(e.target.value)} placeholder="Enter AWB number" className="flex-1 border px-3 py-2 text-sm" />
                <button onClick={handleAddAWB} disabled={!awbNumber} className="bg-brand-accent text-white px-4 py-2 text-sm disabled:opacity-50">
                  Add
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not applicable</p>
            )}
          </div>

          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">Actions</h3>
            <div className="space-y-2">
              {order.orderStatus === 'PAID' && (
                <button onClick={() => handleStatusUpdate('PROCESSING')} className="w-full bg-blue-500 text-white py-2 text-sm">Mark as Processing</button>
              )}
              {order.orderStatus === 'PROCESSING' && (
                <button onClick={() => handleStatusUpdate('SHIPPED')} className="w-full bg-purple-500 text-white py-2 text-sm">Mark as Shipped</button>
              )}
              {order.orderStatus === 'SHIPPED' && (
                <button onClick={() => handleStatusUpdate('DELIVERED')} className="w-full bg-green-500 text-white py-2 text-sm">Mark as Delivered</button>
              )}
              {order.orderStatus === 'DELIVERED' && (
                <button onClick={() => handleStatusUpdate('COMPLETED')} className="w-full bg-green-600 text-white py-2 text-sm">Mark as Completed</button>
              )}
            </div>
          </div>

          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">Payment</h3>
            {order.payment ? (
              <div className="text-sm">
                <span className={`px-2 py-1 text-xs ${order.payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.payment.status}</span>
                <span className="ml-2">Rp {Number(order.payment.amount).toLocaleString()}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
