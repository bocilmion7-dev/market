import { Link } from 'react-router-dom';
import { useMyOrders } from '@/features/orders/hooks';
import { Skeleton, EmptyState } from '@/components/ui';

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { data, isLoading } = useMyOrders();
  const orders = data?.orders || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div className="bg-[rgb(var(--bg-primary))]">
          <EmptyState
            title="Belum ada pesanan"
            description="Mulai berbelanja untuk melihat pesanan Anda di sini"
            action={{ label: 'Jelajahi Produk', onClick: () => { window.location.href = '/products'; } }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-[rgb(var(--text-muted))] mt-1">
                    {order.publisher?.fullName || 'Publisher'}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-sm ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {order.orderStatus}
                  </span>
                  <p className="text-sm font-semibold mt-1">Rp {Number(order.grandTotal).toLocaleString('id-ID')}</p>
                </div>
              </div>
              {order.shipment?.awb && (
                <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                  {order.shipment.courier} {order.shipment.service} — AWB: {order.shipment.awb}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
