import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublisherOrderDetail, useAddAWB, useShipOrder, ShipOrderParams } from '@/features/orders/hooks';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const COURIER_OPTIONS = [
  { code: 'jne', name: 'JNE' },
  { code: 'jnt', name: 'J&T Express' },
  { code: 'sicepat', name: 'SiCepat' },
  { code: 'anteraja', name: 'AnterAja' },
  { code: 'tiki', name: 'TIKI' },
  { code: 'wahana', name: 'Wahana' },
  { code: 'pos', name: 'POS Indonesia' },
  { code: 'ninja', name: 'Ninja Express' },
  { code: 'grab', name: 'Grab Express' },
  { code: 'gojek', name: 'GoSend' },
];

const SERVICE_OPTIONS: Record<string, string[]> = {
  jne: ['reg', 'oke', 'yes'],
  jnt: ['ez', 'ctc', 'cop'],
  sicepat: ['reg', 'ind', 'cop', 'sds'],
  anteraja: ['sds', 'reg', 'dsk'],
  tiki: ['reg', 'oke', 'tds', 'hds'],
  wahana: ['reg', 'dsk'],
  pos: ['reg', 'pkg', 'oke', 'ems'],
  ninja: ['reg', 'snt', 'cod'],
  grab: ['instant', 'same_day'],
  gojek: ['instant', 'same_day'],
};

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function PublisherOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = usePublisherOrderDetail(id || '');
  const addAWB = useAddAWB();
  const shipOrder = useShipOrder();
  const [awbNumber, setAwbNumber] = useState('');
  const [awbCourier, setAwbCourier] = useState('');
  const [awbService, setAwbService] = useState('');
  const [editingAwb, setEditingAwb] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);

  const { data: shippingSettings } = useQuery<{ providers: { id: string; name: string }[] }>({
    queryKey: ['shippingSettings'],
    queryFn: () => api.get('/shipping/settings'),
  });

  const activeProvider = shippingSettings?.providers?.[0]?.id || 'rajaongkir';
  const isRajaOngkir = activeProvider === 'rajaongkir';

  useEffect(() => {
    if (order) {
      setAwbCourier(order.shippingCourier || '');
      setAwbService(order.shippingService || '');
    }
  }, [order?.shippingCourier, order?.shippingService]);

  const handleAddAWB = () => {
    if (!awbNumber || !id) return;
    addAWB.mutate(
      { id, awbNumber, courier: awbCourier || undefined, service: awbService || undefined },
      { onSuccess: () => { setEditingAwb(false); } }
    );
  };

  const startEditAwb = () => {
    setAwbNumber(order?.shipment?.awb || '');
    setAwbCourier(order?.shipment?.courier || order?.shippingCourier || '');
    setAwbService(order?.shipment?.service || order?.shippingService || '');
    setEditingAwb(true);
  };

  const handleShipOrder = () => {
    if (!id || !order) return;

    const origin = order.publisher;
    const dest = order.shippingAddress;
    if (!origin?.address || !origin?.postalCode || !dest?.address || !dest?.postalCode) {
      alert('Data alamat pengirim atau penerima belum lengkap');
      return;
    }

    const itemsWithWeight = order.items?.map((item: any) => ({
      name: item.productNameSnapshot || 'Product',
      value: Number(item.subtotalMarketplacePrice) || 0,
      quantity: item.quantity || 1,
      weight: item.product?.weight || 0,
    })) || [];

    const missingWeightItems = itemsWithWeight.filter((item: any) => item.weight <= 0);
    if (missingWeightItems.length > 0) {
      alert('Beberapa produk belum memiliki data berat. Silakan edit produk untuk mengatur berat terlebih dahulu.');
      return;
    }

    const missingValueItems = itemsWithWeight.filter((item: any) => item.value <= 0);
    if (missingValueItems.length > 0) {
      alert('Beberapa produk belum memiliki data harga. Silakan edit produk untuk mengatur harga terlebih dahulu.');
      return;
    }

    const params: ShipOrderParams = {
      orderId: id,
      origin: {
        contact_name: order.publisher?.fullName || 'Publisher',
        contact_phone: order.publisher?.phone || '080000000000',
        address: order.publisher?.address || '',
        postal_code: order.publisher?.postalCode ? Number(order.publisher.postalCode) : 0,
      },
      destination: {
        contact_name: order.customer?.name || 'Customer',
        contact_phone: order.customer?.phone || order.customer?.email || '080000000000',
        address: order.shippingAddress?.fullAddress || order.shippingAddress?.address || '',
        postal_code: order.shippingAddress?.postalCode ? Number(order.shippingAddress.postalCode) : 0,
      },
      courier_company: order.shippingCourier || 'jne',
      courier_type: order.shippingService || 'reg',
      items: itemsWithWeight,
      order_note: 'Shipped via Biteship',
    };

    shipOrder.mutate(params, {
      onSuccess: () => setShowShipForm(false),
    });
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (!order) return <div className="p-6 text-center text-gray-500">Order not found</div>;

  const showAwbInput = isRajaOngkir && (editingAwb || (!order.shipment?.awb && (order.orderStatus === 'PAID' || order.orderStatus === 'PROCESSING')));
  const isBusy = addAWB.isPending || shipOrder.isPending;

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
            <h3 className="font-bold mb-3">Shipping Info</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress?.fullAddress || '—'}</p>
            {order.shipment ? (
              <>
                <p className="text-sm text-gray-500 mt-2">Courier: {order.shipment.courier} — {order.shipment.service}</p>
                {order.shipment.awb && <p className="text-sm font-mono mt-1">AWB: {order.shipment.awb}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Courier: {order.shippingCourier ? `${order.shippingCourier.toUpperCase()} ${order.shippingService || ''}` : '—'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">AWB / Nomor Resi</h3>
            {showAwbInput ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input value={awbNumber} onChange={(e) => setAwbNumber(e.target.value)} placeholder="Masukkan nomor AWB..." className="flex-1 border px-3 py-2 text-sm" />
                  <button onClick={handleAddAWB} disabled={!awbNumber || isBusy} className="bg-brand-accent text-white px-4 py-2 text-sm disabled:opacity-50 rounded-sm">
                    {addAWB.isPending && <Spinner />}
                    {addAWB.isPending ? 'Saving...' : 'Simpan'}
                  </button>
                  {editingAwb && (
                    <button onClick={() => setEditingAwb(false)} disabled={isBusy} className="border px-4 py-2 text-sm rounded-sm">
                      Batal
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={awbCourier}
                    onChange={(e) => { setAwbCourier(e.target.value); setAwbService(''); }}
                    className="border px-3 py-2 text-sm"
                  >
                    <option value="">Pilih Kurir...</option>
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={awbService}
                    onChange={(e) => setAwbService(e.target.value)}
                    disabled={!awbCourier}
                    className="border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">Pilih Layanan...</option>
                    {(SERVICE_OPTIONS[awbCourier] || []).map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : order.shipment?.awb ? (
              <div className="flex items-center gap-3">
                <p className="text-lg font-mono text-brand-accent">{order.shipment.awb}</p>
                <button onClick={startEditAwb} disabled={isBusy} className="text-xs text-gray-500 hover:text-brand-accent underline">
                  Edit
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum tersedia</p>
            )}
          </div>

          <div className="bg-white p-4">
            <h3 className="font-bold mb-3">Actions</h3>
            <div className="space-y-2">
              {(order.orderStatus === 'PAID' || order.orderStatus === 'PROCESSING') && !order.shipment?.awb && (
                <button onClick={() => setShowShipForm(true)} disabled={isBusy} className="w-full bg-orange-500 text-white py-2 text-sm rounded-sm disabled:opacity-50">
                  {shipOrder.isPending && <Spinner />}
                  {shipOrder.isPending ? 'Memproses...' : 'PROCESS'}
                </button>
              )}
            </div>
          </div>

          {showShipForm && (
            <div className="bg-white p-4">
              <h3 className="font-bold mb-3">Konfirmasi Pengiriman</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">Pengirim: <span className="font-medium text-gray-800">{order.publisher?.fullName}</span></p>
                  <p className="text-gray-600">Kurir: <span className="font-medium text-gray-800">{(order.shippingCourier || 'jne').toUpperCase()} {order.shippingService?.toUpperCase()}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShipOrder} disabled={shipOrder.isPending} className="flex-1 bg-orange-500 text-white py-2 text-sm rounded-sm disabled:opacity-50">
                    {shipOrder.isPending && <Spinner />}
                    {shipOrder.isPending ? 'Memproses...' : 'Konfirmasi & Proses'}
                  </button>
                  <button onClick={() => setShowShipForm(false)} disabled={shipOrder.isPending} className="border px-4 py-2 text-sm rounded-sm">
                    Batal
                  </button>
                </div>
                {shipOrder.isError && (
                  <p className="text-red-500 text-sm">{(shipOrder.error as any)?.message || 'Gagal memproses'}</p>
                )}
              </div>
            </div>
          )}

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
