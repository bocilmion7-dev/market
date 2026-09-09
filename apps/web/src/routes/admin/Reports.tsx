import { useState } from 'react';
import { useSalesReport, usePublisherReport } from '@/features/admin/reportHooks';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'sales' | 'publishers'>('sales');

  const { data: salesData, isLoading: salesLoading } = useSalesReport(startDate, endDate);
  const { data: publisherData } = usePublisherReport();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 ${
            activeTab === 'sales' ? 'bg-brand-accent text-white' : 'bg-white border'
          }`}
        >
          Sales Report
        </button>
        <button
          onClick={() => setActiveTab('publishers')}
          className={`px-4 py-2 ${
            activeTab === 'publishers' ? 'bg-brand-accent text-white' : 'bg-white border'
          }`}
        >
          Publisher Report
        </button>
      </div>

      {activeTab === 'sales' && (
        <div>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-brand-accent">
                Rp {Number(salesData?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{salesData?.totalOrders || 0}</p>
            </div>
            <div className="bg-white p-4">
              <p className="text-sm text-gray-500">Average Order</p>
              <p className="text-2xl font-bold">
                Rp {Number(salesData?.averageOrder || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {salesData && salesData.byDay && salesData.byDay.length > 0 && (
            <div className="bg-white p-4">
              <h3 className="font-bold mb-3">Daily Breakdown</h3>
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 text-left text-sm">Date</th>
                    <th className="p-2 text-left text-sm">Orders</th>
                    <th className="p-2 text-left text-sm">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.byDay.map((day: any) => (
                    <tr key={day.date} className="border-b">
                      <td className="p-2 text-sm">{day.date}</td>
                      <td className="p-2 text-sm">{day.count}</td>
                      <td className="p-2 text-sm">Rp {Number(day.revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'publishers' && (
        <div className="bg-white p-4">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="p-2 text-left text-sm">Publisher</th>
                <th className="p-2 text-left text-sm">Orders</th>
                <th className="p-2 text-left text-sm">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {publisherData?.map((pub: any) => (
                <tr key={pub.publisherId} className="border-b">
                  <td className="p-2 text-sm">{pub.publisherName}</td>
                  <td className="p-2 text-sm">{pub.orderCount}</td>
                  <td className="p-2 text-sm">Rp {Number(pub.totalRevenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
