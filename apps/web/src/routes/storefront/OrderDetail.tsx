import { useParams, Link } from 'react-router-dom';
import { useMyOrderDetail, useShipmentTracking } from '@/features/orders/hooks';
import { Skeleton } from '@/components/ui';

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function TrackingTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-[rgb(var(--text-muted))]">Belum ada data pelacakan.</p>;
  }

  return (
    <div className="relative ml-3 border-l-2 border-[rgb(var(--border))] space-y-0">
      {events.map((ev: any, i: number) => (
        <div key={ev.id || i} className="relative pl-6 pb-6 last:pb-0">
          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[rgb(var(--bg-primary))] ${i === events.length - 1 ? 'bg-brand-accent' : 'bg-gray-300'}`} />
          <p className="text-sm font-medium">{ev.status}</p>
          {ev.description && <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{ev.description}</p>}
          <div className="flex items-center gap-2 mt-0.5">
            {ev.location && <span className="text-xs text-[rgb(var(--text-muted))]">{ev.location}</span>}
            <span className="text-xs text-[rgb(var(--text-muted))]">
              {new Date(ev.eventTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useMyOrderDetail(id || '');
  const { data: trackingData } = useShipmentTracking(order?.shipment?.id || '');

  const trackingEvents = trackingData?.tracking || order?.shipment?.tracking || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 text-center">
        <p className="text-gray-500">Pesanan tidak ditemukan.</p>
        <Link to="/orders" className="text-brand-accent hover:underline text-sm mt-2 inline-block">&larr; Kembali ke Pesanan</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <Link to="/orders" className="text-sm text-[rgb(var(--text-muted))] hover:text-brand-accent">&larr; Semua Pesanan</Link>

      <div className="flex items-center justify-between gap-3 mt-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-sm ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 mb-4">
        <h2 className="font-semibold mb-3">Item Pesanan</h2>
        <div className="divide-y divide-[rgb(var(--border))]">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.productNameSnapshot}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold shrink-0 ml-3">Rp {Number(item.marketplacePriceSnapshot).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[rgb(var(--border))] mt-3 pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--text-muted))]">Subtotal</span>
            <span>Rp {Number(order.subtotalMarketplacePrice).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--text-muted))]">Ongkos Kirim</span>
            <span>Rp {Number(order.shippingCost).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span>Rp {Number(order.grandTotal).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 mb-4">
          <h2 className="font-semibold mb-2">Alamat Pengiriman</h2>
          <p className="text-sm">{order.shippingAddress.recipientName || order.customer?.name}</p>
          <p className="text-sm text-[rgb(var(--text-muted))]">{order.shippingAddress.fullAddress || order.shippingAddress.address}</p>
          <p className="text-sm text-[rgb(var(--text-muted))]">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
          <p className="text-sm text-[rgb(var(--text-muted))]">{order.shippingAddress.phone}</p>
        </div>
      )}

      <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Pelacakan Pengiriman</h2>
          {order.shipment?.awb && (
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-brand-accent hover:underline"
            >
              Muat ulang
            </button>
          )}
        </div>
        {order.shipment ? (
          <>
            <div className="flex items-center gap-3 mb-4 text-sm">
              <span className="font-medium">{order.shipment.courier}</span>
              <span className="text-[rgb(var(--text-muted))]">{order.shipment.service}</span>
              {order.shipment.awb && (
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{order.shipment.awb}</span>
              )}
            </div>
            <TrackingTimeline events={trackingEvents} />
          </>
        ) : (
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'PAID'
              ? 'Pengiriman akan diproses setelah pembayaran dikonfirmasi.'
              : 'Belum ada informasi pengiriman.'}
          </p>
        )}
      </div>
    </div>
  );
}
