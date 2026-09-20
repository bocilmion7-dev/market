import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminOrders } from '@/features/orders/hooks';

const STATUS_OPTIONS = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { data, isLoading } = useAdminOrders(page, status || undefined, search || undefined);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6">All Orders</h1>

      <div className="mb-4 flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search order number, customer..."
          className="flex-1 border px-3 py-2 text-sm"
        />
        <button onClick={handleSearch} className="bg-brand-accent text-white px-4 py-2 text-sm rounded-sm">Search</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => { setStatus(''); setPage(1); }} className={`px-3 py-1 text-sm rounded-sm whitespace-nowrap ${!status ? 'bg-brand-accent text-white' : 'bg-white border'}`}>All</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1 text-sm rounded-sm whitespace-nowrap ${status === s ? 'bg-brand-accent text-white' : 'bg-white border'}`}>{s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      <div className="bg-white shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Publisher</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Order Status</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">AWB</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="p-4 text-center">Loading...</td></tr>
            ) : data?.orders?.length === 0 ? (
              <tr><td colSpan={9} className="p-4 text-center text-gray-500">No orders</td></tr>
            ) : (
              data?.orders?.map((order: any) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-mono">{order.orderNumber}</td>
                  <td className="p-3 text-sm">{order.customer?.name || '—'}</td>
                  <td className="p-3 text-sm">{order.publisher?.fullName || '—'}</td>
                  <td className="p-3 text-sm">Rp {Number(order.grandTotal).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs ${
                      order.orderStatus === 'PAID' ? 'bg-blue-100 text-blue-700' :
                      order.orderStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                      order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      order.orderStatus === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{order.orderStatus?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="p-3 text-sm font-mono">{order.shipment?.awb || '—'}</td>
                  <td className="p-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link to={`/admin/orders/${order.id}`} className="text-brand-accent hover:underline text-sm">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded-sm disabled:opacity-50">Prev</button>
          <span className="px-3 py-1 text-sm">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1 text-sm border rounded-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
