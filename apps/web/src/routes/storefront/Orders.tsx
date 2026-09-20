import { Link } from 'react-router-dom';
import { useMyOrders } from '@/features/orders/hooks';
import { Skeleton, EmptyState, PageTransition } from '@/components/ui';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING_PAYMENT: { label: 'Belum Bayar', color: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: Clock },
  PAID: { label: 'Dibayar', color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: CheckCircle },
  PROCESSING: { label: 'Diproses', color: 'text-indigo-700', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: Package },
  SHIPPED: { label: 'Dikirim', color: 'text-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: Truck },
  DELIVERED: { label: 'Diterima', color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
  COMPLETED: { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
  CANCELLED: { label: 'Dibatalkan', color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
};

export default function Orders() {
  const { data, isLoading } = useMyOrders();
  const orders = data?.orders || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Pesanan Saya</h1>
            <p className="text-sm text-[rgb(var(--text-muted))]">{orders.length} pesanan</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[rgb(var(--bg-primary))] rounded-sm border border-[rgb(var(--border))]">
            <EmptyState
              title="Belum ada pesanan"
              description="Mulai berbelanja untuk melihat pesanan Anda di sini"
              action={{ label: 'Jelajahi Produk', onClick: () => { window.location.href = '/products'; } }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const statusInfo = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, color: 'text-gray-700', bg: 'bg-gray-50', icon: Package };
              const StatusIcon = statusInfo.icon;
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 hover:shadow-md transition-all duration-200 hover:border-brand-accent/30 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-sm ${statusInfo.color} ${statusInfo.bg}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[rgb(var(--text-muted))]">
                        {order.publisher?.fullName || 'Publisher'}
                      </p>
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {order.shipment?.awb && (
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-1.5 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {order.shipment.courier} {order.shipment.service} — {order.shipment.awb}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="text-base font-bold">Rp {Number(order.grandTotal).toLocaleString('id-ID')}</p>
                      <ChevronRight className="w-4 h-4 text-[rgb(var(--text-muted))] group-hover:text-brand-accent transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
