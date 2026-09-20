import { useState } from 'react';
import { usePublisherSalesReport } from '@/features/publisher/hooks';
import { Button, Input, Skeleton } from '@/components/ui';

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Dibayar',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  DELIVERED: 'Diterima',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-cyan-100 text-cyan-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function PublisherReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'daily' | 'products' | 'status'>('daily');

  const { data, isLoading } = usePublisherSalesReport(startDate, endDate);

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Laporan Penjualan</h1>

      {/* Date Filter */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-44"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-44"
          />
        </div>
        {(startDate || endDate) && (
          <Button variant="secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
            Reset
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
          <p className="text-sm text-[rgb(var(--text-muted))]">Total Pendapatan</p>
          <p className="text-2xl font-bold text-brand-accent">{formatRp(data?.totalRevenue || 0)}</p>
        </div>
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
          <p className="text-sm text-[rgb(var(--text-muted))]">Total Pesanan</p>
          <p className="text-2xl font-bold">{data?.totalOrders || 0}</p>
        </div>
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
          <p className="text-sm text-[rgb(var(--text-muted))]">Rata-rata Pesanan</p>
          <p className="text-2xl font-bold">{formatRp(data?.averageOrder || 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'daily' as const, label: 'Harian' },
          { key: 'products' as const, label: 'Produk' },
          { key: 'status' as const, label: 'Status' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-sm border ${
              activeTab === tab.key
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'border-[rgb(var(--border))] hover:border-brand-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daily Breakdown */}
      {activeTab === 'daily' && (
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm overflow-hidden">
          {(!data?.byDay || data.byDay.length === 0) ? (
            <p className="p-6 text-center text-[rgb(var(--text-muted))]">Tidak ada data penjualan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgb(var(--bg-secondary))]">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Tanggal</th>
                    <th className="p-3 text-right text-sm font-medium">Pesanan</th>
                    <th className="p-3 text-right text-sm font-medium">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byDay.map((day) => (
                    <tr key={day.date} className="border-t border-[rgb(var(--border))]">
                      <td className="p-3 text-sm">
                        {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-sm text-right">{day.count}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatRp(day.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Breakdown */}
      {activeTab === 'products' && (
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm overflow-hidden">
          {(!data?.byProduct || data.byProduct.length === 0) ? (
            <p className="p-6 text-center text-[rgb(var(--text-muted))]">Tidak ada data produk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgb(var(--bg-secondary))]">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium"> Produk</th>
                    <th className="p-3 text-right text-sm font-medium">Terjual</th>
                    <th className="p-3 text-right text-sm font-medium">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byProduct.map((product) => (
                    <tr key={product.productId} className="border-t border-[rgb(var(--border))]">
                      <td className="p-3 text-sm">{product.name}</td>
                      <td className="p-3 text-sm text-right">{product.quantity}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatRp(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Status Breakdown */}
      {activeTab === 'status' && (
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm overflow-hidden">
          {(!data?.byStatus || data.byStatus.length === 0) ? (
            <p className="p-6 text-center text-[rgb(var(--text-muted))]">Tidak ada data status.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgb(var(--bg-secondary))]">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-right text-sm font-medium">Pesanan</th>
                    <th className="p-3 text-right text-sm font-medium">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byStatus.map((s) => (
                    <tr key={s.status} className="border-t border-[rgb(var(--border))]">
                      <td className="p-3 text-sm">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-sm ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right">{s.count}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatRp(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
