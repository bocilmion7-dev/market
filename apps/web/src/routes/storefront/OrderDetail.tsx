import { useParams, Link } from 'react-router-dom';
import { useMyOrderDetail, useShipmentTracking } from '@/features/orders/hooks';
import { usePaymentPublicSettings } from '@/features/admin/hooks';
import { Skeleton, PageTransition } from '@/components/ui';
import {
  Package, Truck, MapPin, Clock, ArrowLeft, RefreshCw,
  CheckCircle, CreditCard, Copy, ExternalLink
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  PENDING_PAYMENT: { label: 'Belum Bayar', color: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/20', step: 1 },
  PAID: { label: 'Dibayar', color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/20', step: 2 },
  PROCESSING: { label: 'Diproses', color: 'text-indigo-700', bg: 'bg-indigo-50 dark:bg-indigo-900/20', step: 3 },
  SHIPPED: { label: 'Dikirim', color: 'text-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/20', step: 4 },
  DELIVERED: { label: 'Diterima', color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/20', step: 5 },
  COMPLETED: { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/20', step: 5 },
  CANCELLED: { label: 'Dibatalkan', color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-900/20', step: 0 },
};

const orderSteps = [
  { id: 1, label: 'Dibuat', icon: Package },
  { id: 2, label: 'Dibayar', icon: CreditCard },
  { id: 3, label: 'Diproses', icon: Package },
  { id: 4, label: 'Dikirim', icon: Truck },
  { id: 5, label: 'Diterima', icon: CheckCircle },
];

function OrderStepIndicator({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null;
  return (
    <div className="flex items-center justify-between mb-6">
      {orderSteps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-brand-accent text-white ring-4 ring-brand-accent/20'
                    : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-muted))]'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'text-brand-accent' : 'text-[rgb(var(--text-muted))]'}`}>
                {step.label}
              </span>
            </div>
            {index < orderSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-14px] transition-colors ${
                isCompleted ? 'bg-green-500' : 'bg-[rgb(var(--bg-tertiary))]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrackingTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-10 h-10 mx-auto text-[rgb(var(--text-muted))] mb-2" />
        <p className="text-sm text-[rgb(var(--text-muted))]">Belum ada data pelacakan</p>
      </div>
    );
  }

  return (
    <div className="relative ml-4 border-l-2 border-[rgb(var(--border))] space-y-0">
      {events.map((ev: any, i: number) => (
        <div key={ev.id || i} className="relative pl-6 pb-5 last:pb-0">
          <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 border-[rgb(var(--bg-primary))] flex items-center justify-center ${
            i === events.length - 1 ? 'bg-brand-accent' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            {i === events.length - 1 && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <div className="bg-[rgb(var(--bg-secondary))] rounded-sm p-3">
            <p className="text-sm font-medium">{ev.status}</p>
            {ev.description && <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{ev.description}</p>}
            <div className="flex items-center gap-3 mt-1.5">
              {ev.location && (
                <span className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{ev.location}
                </span>
              )}
              <span className="text-xs text-[rgb(var(--text-muted))] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(ev.eventTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useMyOrderDetail(id || '');
  const { data: trackingData, refetch: refetchTracking } = useShipmentTracking(order?.shipment?.id || '');
  const isQrisPayment = order?.notes?.includes('PAYMENT:QRIS');
  const { data: paymentSettings } = usePaymentPublicSettings({
    enabled: !!order && isQrisPayment === true && order.orderStatus === 'PENDING_PAYMENT',
  });

  const trackingEvents = trackingData?.tracking || order?.shipment?.tracking || [];
  const waNumber = paymentSettings?.whatsapp?.phoneNumber;
  const statusInfo = STATUS_CONFIG[order?.orderStatus || ''] || { label: order?.orderStatus, color: 'text-gray-700', bg: 'bg-gray-50', step: 0 };

  const handleSendBukti = () => {
    if (!waNumber || !order) return;
    const message = encodeURIComponent(
      `Halo, saya ingin mengkonfirmasi pembayaran.\n\n` +
      `No. Pesanan: ${order.orderNumber}\n` +
      `Total: Rp ${Number(order.grandTotal).toLocaleString('id-ID')}\n\n` +
      `Sudah melakukan transfer via QRIS. Terima kasih.`
    );
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20" />
        <Skeleton className="h-40" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 text-center">
        <Package className="w-16 h-16 mx-auto text-[rgb(var(--text-muted))] mb-4" />
        <p className="text-lg font-medium mb-2">Pesanan tidak ditemukan</p>
        <Link to="/orders" className="text-brand-accent hover:underline text-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--text-muted))] hover:text-brand-accent mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Semua Pesanan
        </Link>

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-base md:text-lg font-bold font-mono break-all">{order.orderNumber}</h1>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-sm ${statusInfo.color} ${statusInfo.bg}`}>
            {statusInfo.label}
          </span>
        </div>

        <OrderStepIndicator currentStep={statusInfo.step} />

        {/* QRIS Payment Section */}
        {isQrisPayment && order.orderStatus === 'PENDING_PAYMENT' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              <h2 className="font-semibold text-yellow-800 dark:text-yellow-200">Pembayaran QRIS</h2>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Scan QR Code di bawah ini, lalu kirim bukti pembayaran via WhatsApp.
            </p>
            {paymentSettings?.qris?.qrImageUrl && (
              <div className="text-center mb-4">
                <img
                  src={paymentSettings.qris.qrImageUrl}
                  alt="QRIS Code"
                  className="mx-auto h-56 w-56 object-contain border rounded-sm bg-white p-2"
                />
              </div>
            )}
            {waNumber && (
              <button
                onClick={handleSendBukti}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Kirim Bukti via WhatsApp
              </button>
            )}
            {!waNumber && (
              <p className="text-sm text-yellow-600">Nomor WhatsApp belum dikonfigurasi oleh admin.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-4">
            {/* Items */}
            <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-accent" />
                Item Pesanan
              </h2>
              <div className="divide-y divide-[rgb(var(--border))]">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.productNameSnapshot}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0 ml-3">Rp {Number(item.marketplacePriceSnapshot).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[rgb(var(--border))] mt-3 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--text-muted))]">Subtotal</span>
                  <span>Rp {Number(order.subtotalMarketplacePrice).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--text-muted))]">Ongkos Kirim</span>
                  <span>Rp {Number(order.shippingCost).toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-[rgb(var(--border))] pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-brand-accent">Rp {Number(order.grandTotal).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-accent" />
                  Alamat Pengiriman
                </h2>
                <p className="text-sm font-medium">{order.shippingAddress.recipientName || order.customer?.name}</p>
                <p className="text-sm text-[rgb(var(--text-muted))]">{order.shippingAddress.fullAddress || order.shippingAddress.address}</p>
                <p className="text-sm text-[rgb(var(--text-muted))]">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                <p className="text-sm text-[rgb(var(--text-muted))]">{order.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Right Column - Tracking */}
          <div className="md:col-span-1">
            <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 md:sticky md:top-20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-accent" />
                  Pelacakan
                </h2>
                {order.shipment?.awb && (
                  <button
                    onClick={() => refetchTracking()}
                    className="p-1.5 text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
              {order.shipment ? (
                <>
                  <div className="bg-[rgb(var(--bg-secondary))] rounded-sm p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{order.shipment.courier}</span>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{order.shipment.service}</span>
                    </div>
                    {order.shipment.awb && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-[rgb(var(--bg-tertiary))] px-2 py-0.5 rounded font-mono">{order.shipment.awb}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.shipment.awb);
                          }}
                          className="text-[rgb(var(--text-muted))] hover:text-brand-accent transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <TrackingTimeline events={trackingEvents} />
                </>
              ) : (
                <div className="text-center py-4">
                  <Truck className="w-8 h-8 mx-auto text-[rgb(var(--text-muted))] mb-2" />
                  <p className="text-sm text-[rgb(var(--text-muted))]">
                    {order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'PAID'
                      ? 'Pengiriman akan diproses setelah pembayaran.'
                      : 'Belum ada informasi pengiriman.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
