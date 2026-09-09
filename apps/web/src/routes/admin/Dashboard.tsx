import { useDashboardStats } from '@/features/admin/reportHooks';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-blue-500' },
          { label: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-green-500' },
          { label: 'Customers', value: stats?.totalCustomers || 0, color: 'bg-purple-500' },
          { label: 'Publishers', value: stats?.totalPublishers || 0, color: 'bg-orange-500' },
          {
            label: 'Pending Approvals',
            value: stats?.pendingApprovals || 0,
            color: 'bg-yellow-500',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4">
            <div className={`h-1 ${card.color} rounded-full mb-3`} />
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold">{isLoading ? '—' : card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="p-2 text-left text-sm">Order #</th>
              <th className="p-2 text-left text-sm">Customer</th>
              <th className="p-2 text-left text-sm">Amount</th>
              <th className="p-2 text-left text-sm">Status</th>
              <th className="p-2 text-left text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders?.map((order: any) => (
              <tr key={order.id} className="border-b">
                <td className="p-2 text-sm font-mono">{order.orderNumber}</td>
                <td className="p-2 text-sm">{order.customer?.name}</td>
                <td className="p-2 text-sm">Rp {Number(order.grandTotal).toLocaleString()}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.orderStatus === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : order.orderStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-2 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
