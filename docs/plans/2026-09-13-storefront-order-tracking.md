# Storefront Order Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add customer-facing order list and order detail/tracking pages to the storefront, with real-time shipment tracking via RajaOngkir paid API.

**Architecture:** Integrate RajaOngkir tracking API (`POST /track/waybill`) into the backend, expose tracking data through a customer-owned endpoint, cache tracking events in the `ShippingTracking` table, and create two new storefront pages (order list + order detail with tracking timeline).

**Tech Stack:** Express.js, Prisma, React, TanStack Query, Tailwind CSS, React Router v6, RajaOngkir Komerce API

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `apps/api/src/services/rajaongkir.service.ts` | Add `trackWaybill()` using RajaOngkir Komerce API |
| Modify | `apps/api/src/services/order.service.ts` | Include `shipment` with `tracking` in order queries |
| Create | `apps/api/src/routes/shipments.ts` | Customer shipment tracking endpoint (fetches from RajaOngkir, caches in DB) |
| Modify | `apps/api/src/app.ts` | Mount new shipment routes |
| Modify | `apps/web/src/features/orders/hooks.ts` | Add `useMyOrders`, `useMyOrderDetail`, `useShipmentTracking` hooks |
| Create | `apps/web/src/routes/storefront/Orders.tsx` | Customer order list page |
| Create | `apps/web/src/routes/storefront/OrderDetail.tsx` | Customer order detail + tracking page |
| Modify | `apps/web/src/App.tsx` | Add `/orders` and `/orders/:id` routes |

---

### Task 1: Add RajaOngkir Tracking Function to Service

**Files:**
- Modify: `apps/api/src/services/rajaongkir.service.ts`

The RajaOngkir Komerce API provides `POST /api/v1/track/waybill` for real-time AWB tracking. This requires a paid plan. The current service only has cost calculation functions.

- [ ] **Step 1: Add tracking API base URL constant**

Edit `apps/api/src/services/rajaongkir.service.ts` — add a new constant after line 2:

```ts
const RAJAONGKIR_TRACKING_URL = process.env.RAJAONGKIR_TRACKING_URL || 'https://rajaongkir.komerce.id/api/v1';
```

- [ ] **Step 2: Add trackWaybill function**

Edit `apps/api/src/services/rajaongkir.service.ts` — append at the end of the file (after the `getDistricts` function):

```ts
export interface TrackingEvent {
  manifest_code: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name: string;
}

export interface TrackingResult {
  delivered: boolean;
  summary: {
    courier_code: string;
    courier_name: string;
    waybill_number: string;
    service_code: string;
    waybill_date: string;
    shipper_name: string;
    receiver_name: string;
    origin: string;
    destination: string;
  };
  delivery_status: {
    status: string;
    pod_receiver: string;
    pod_date: string;
    pod_time: string;
  };
  manifest: TrackingEvent[];
}

export async function trackWaybill(awb: string, courier: string): Promise<TrackingResult | null> {
  const url = new URL(`${RAJAONGKIR_TRACKING_URL}/track/waybill`);
  url.searchParams.set('awb', awb);
  url.searchParams.set('courier', courier);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      key: RAJAONGKIR_API_KEY,
    },
  });

  const data = await response.json() as any;

  if (!data.data) {
    return null;
  }

  return {
    delivered: data.data.delivered || false,
    summary: {
      courier_code: data.data.summary?.courier_code || '',
      courier_name: data.data.summary?.courier_name || '',
      waybill_number: data.data.summary?.waybill_number || '',
      service_code: data.data.summary?.service_code || '',
      waybill_date: data.data.summary?.waybill_date || '',
      shipper_name: data.data.summary?.shipper_name || '',
      receiver_name: data.data.summary?.receiver_name || '',
      origin: data.data.summary?.origin || '',
      destination: data.data.summary?.destination || '',
    },
    delivery_status: {
      status: data.data.delivery_status?.status || '',
      pod_receiver: data.data.delivery_status?.pod_receiver || '',
      pod_date: data.data.delivery_status?.pod_date || '',
      pod_time: data.data.delivery_status?.pod_time || '',
    },
    manifest: (data.data.manifest || []).map((m: any) => ({
      manifest_code: m.manifest_code || '',
      manifest_description: m.manifest_description || '',
      manifest_date: m.manifest_date || '',
      manifest_time: m.manifest_time || '',
      city_name: m.city_name || '',
    })),
  };
}
```

- [ ] **Step 3: Verify backend compiles**

Run: `cd /root/marketplace && npx tsc --noEmit -p apps/api/tsconfig.json`
Expected: No errors

---

### Task 2: Extend Backend Order Service to Include Shipment Data

**Files:**
- Modify: `apps/api/src/services/order.service.ts:111-145`

The existing `getUserOrders` and `getOrderDetail` functions don't include `shipment` in their Prisma queries. Customers need to see shipment info (courier, AWB, status) and tracking events.

- [ ] **Step 1: Add shipment with tracking to getUserOrders query**

Edit `apps/api/src/services/order.service.ts` — in the `getUserOrders` function, add `shipment` (with nested `tracking`) to the `include` object at line 122:

```ts
prisma.order.findMany({
  where,
  include: {
    items: true,
    payment: true,
    publisher: true,
    shipment: { include: { tracking: { orderBy: { eventTime: 'asc' } } } },
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
}),
```

- [ ] **Step 2: Add shipment with tracking to getOrderDetail query**

Edit `apps/api/src/services/order.service.ts` — in the `getOrderDetail` function, add `shipment` with `tracking` to the `include` object at line 141:

```ts
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    items: true,
    payment: true,
    shippingAddress: true,
    publisher: true,
    shipment: { include: { tracking: { orderBy: { eventTime: 'asc' } } } },
  },
});
```

- [ ] **Step 3: Verify backend compiles**

Run: `cd /root/marketplace && npx tsc --noEmit -p apps/api/tsconfig.json`
Expected: No errors

---

### Task 3: Create Customer Shipment Tracking API with RajaOngkir Integration

**Files:**
- Create: `apps/api/src/routes/shipments.ts`
- Modify: `apps/api/src/app.ts`

SDOT documents `GET /api/shipments/:id/tracking` but it was never implemented. This endpoint fetches real-time tracking from RajaOngkir, caches events in `ShippingTracking`, and returns them to the customer with ownership verification.

- [ ] **Step 1: Create shipment routes file**

Create `apps/api/src/routes/shipments.ts`:

```ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import * as rajaongkirService from '../services/rajaongkir.service';

const router = Router();

router.get('/:id/tracking', authenticate, async (req, res, next) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        tracking: { orderBy: { eventTime: 'asc' } },
        order: { select: { customerId: true, orderNumber: true } },
      },
    });
    if (!shipment) throw new AppError(404, 'NOT_FOUND', 'Shipment not found');

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    const customer = await prisma.customer.findFirst({ where: { email: user.email } });
    if (!customer || shipment.order.customerId !== customer.id) {
      throw new AppError(403, 'FORBIDDEN', 'Not authorized');
    }

    if (shipment.awb && shipment.courier) {
      try {
        const result = await rajaongkirService.trackWaybill(shipment.awb, shipment.courier);

        if (result && result.manifest.length > 0) {
          await prisma.shippingTracking.deleteMany({ where: { shipmentId: shipment.id } });

          await prisma.shippingTracking.createMany({
            data: result.manifest.map((m) => ({
              shipmentId: shipment.id,
              status: m.manifest_description,
              description: m.manifest_description,
              location: m.city_name,
              eventTime: new Date(`${m.manifest_date}T${m.manifest_time}`),
            })),
          });

          if (result.delivered) {
            await prisma.shipment.update({
              where: { id: shipment.id },
              data: {
                status: 'DELIVERED',
                deliveredAt: new Date(),
              },
            });
          }

          const updatedShipment = await prisma.shipment.findUnique({
            where: { id: shipment.id },
            include: { tracking: { orderBy: { eventTime: 'asc' } } },
          });

          return res.json({ success: true, data: updatedShipment });
        }
      } catch (trackingErr) {
        console.error('RajaOngkir tracking failed, returning cached data:', trackingErr);
      }
    }

    res.json({ success: true, data: shipment });
  } catch (err) { next(err); }
});

export default router;
```

- [ ] **Step 2: Mount shipment routes in app.ts**

Edit `apps/api/src/app.ts` — add the import after the existing `orders` import (around line 12):

```ts
import shipmentRoutes from './routes/shipments';
```

Add after the orders route mount (around line 38):

```ts
app.use('/api/shipments', shipmentRoutes);
```

- [ ] **Step 3: Verify backend compiles**

Run: `cd /root/marketplace && npx tsc --noEmit -p apps/api/tsconfig.json`
Expected: No errors

---

### Task 4: Add Customer Order Hooks to Frontend

**Files:**
- Modify: `apps/web/src/features/orders/hooks.ts`

The existing hooks file only has publisher-side hooks. Add customer-side hooks for order list, order detail, and tracking refresh.

- [ ] **Step 1: Add useMyOrders and useMyOrderDetail hooks**

Edit `apps/web/src/features/orders/hooks.ts` — append after the existing `useAddAWB` hook:

```ts
export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => api.get<any>(`/orders?page=${page}`),
  });
}

export function useMyOrderDetail(id: string) {
  return useQuery({
    queryKey: ['myOrder', id],
    queryFn: () => api.get<any>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useShipmentTracking(shipmentId: string) {
  return useQuery({
    queryKey: ['shipmentTracking', shipmentId],
    queryFn: () => api.get<any>(`/shipments/${shipmentId}/tracking`),
    enabled: !!shipmentId,
  });
}
```

- [ ] **Step 2: Verify frontend compiles**

Run: `cd /root/marketplace && npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No new errors

---

### Task 5: Create Customer Order List Page

**Files:**
- Create: `apps/web/src/routes/storefront/Orders.tsx`

This page shows all orders for the logged-in customer with status badges, order numbers, totals, and dates. Follows existing storefront page patterns (Skeleton loading, EmptyState, max-w-4xl layout).

- [ ] **Step 1: Create Orders.tsx**

Create `apps/web/src/routes/storefront/Orders.tsx`:

```tsx
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
```

---

### Task 6: Create Customer Order Detail + Tracking Page

**Files:**
- Create: `apps/web/src/routes/storefront/OrderDetail.tsx`

This is the main tracking page. Shows full order details, shipment info, and a visual tracking timeline. Uses `useShipmentTracking` to trigger live RajaOngkir tracking fetch and displays the timeline from cached `ShippingTracking` events.

- [ ] **Step 1: Create OrderDetail.tsx**

Create `apps/web/src/routes/storefront/OrderDetail.tsx`:

```tsx
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
```

---

### Task 7: Add Routes in App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`

The BottomTabBar already links to `/orders` but no route exists. Add the two new storefront routes.

- [ ] **Step 1: Add imports**

Edit `apps/web/src/App.tsx` — add imports after the existing `WriteReview` import (line 28):

```ts
import Orders from '@/routes/storefront/Orders';
import OrderDetail from '@/routes/storefront/OrderDetail';
```

- [ ] **Step 2: Add routes**

Edit `apps/web/src/App.tsx` — add routes inside the `<Route path="/" element={<StorefrontLayout />}>` block, after the `write-review` route (line 81):

```tsx
<Route path="orders" element={<Orders />} />
<Route path="orders/:id" element={<OrderDetail />} />
```

- [ ] **Step 3: Verify frontend compiles**

Run: `cd /root/marketplace && npx tsc --noEmit -p apps/web/tsconfig.json`
Expected: No new errors

---

### Task 8: Add Environment Variable and Verify

**Files:**
- Modify: `apps/api/.env` (optional, for documentation)

- [ ] **Step 1: Add tracking URL to .env (optional)**

The `RAJAONGKIR_TRACKING_URL` defaults to `https://rajaongkir.komerce.id/api/v1` in code, but can be overridden via env. No change needed unless using a custom endpoint.

- [ ] **Step 2: Run dev server and test manually**

Run: `cd /root/marketplace && npm run dev`

Steps to verify:
1. Login as `admin@marketplace.com` / `admin123`
2. Navigate to `/orders` — should show "Pesanan Saya" page (empty state or order list)
3. Navigate to `/orders/<some-order-id>` — should show order detail with tracking section
4. Bottom tab bar "Tracking" tab should navigate to `/orders`
5. If an order has an AWB, the tracking timeline should show events from RajaOngkir

- [ ] **Step 3: Commit**

```bash
cd /root/marketplace && git add -A && git commit -m "feat: storefront order tracking with RajaOngkir integration"
```
