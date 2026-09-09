import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublisherOrders } from '@/features/orders/hooks';

const STATUS_OPTIONS = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

export default function PublisherOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = usePublisherOrders(page, status || undefined);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setStatus('')} className={`px-3 py-1 text-sm ${!status ? 'bg-brand-accent text-white' : 'bg-white border'}`}>All</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1 text-sm ${status === s ? 'bg-brand-accent text-white' : 'bg-white border'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : data?.orders?.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No orders</td></tr>
            ) : (
              data?.orders?.map((order: any) => (
                <tr key={order.id} className="border-t">
                  <td className="p-3 text-sm font-mono">{order.orderNumber}</td>
                  <td className="p-3 text-sm">{order.customerName || order.customer?.name}</td>
                  <td className="p-3 text-sm">Rp {Number(order.grandTotal).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs ${
                      order.orderStatus === 'PAID' ? 'bg-blue-100 text-blue-700' :
                      order.orderStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                      order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{order.orderStatus}</span>
                  </td>
                  <td className="p-3 text-sm font-mono">{order.shipment?.awb || '—'}</td>
                  <td className="p-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link to={`/publisher/orders/${order.id}`} className="text-brand-accent hover:underline text-sm">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
