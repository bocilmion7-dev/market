import { useDashboardStats } from '@/features/admin/reportHooks';
import { Skeleton, Card } from '@/components/ui';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-green-500' },
    { label: 'Customers', value: stats?.totalCustomers || 0, color: 'bg-purple-500' },
    { label: 'Publishers', value: stats?.totalPublishers || 0, color: 'bg-orange-500' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, color: 'bg-yellow-500' },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} padding="md">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ) : (
              <>
                <div className={`h-1 ${card.color} mb-3`} />
                <p className="text-xs md:text-sm text-[rgb(var(--text-muted))]">{card.label}</p>
                <p className="text-xl md:text-2xl font-bold">{card.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-[rgb(var(--border))]">
              <tr>
                <th className="p-2 text-left text-sm font-medium">Order #</th>
                <th className="p-2 text-left text-sm font-medium">Customer</th>
                <th className="p-2 text-left text-sm font-medium">Amount</th>
                <th className="p-2 text-left text-sm font-medium">Status</th>
                <th className="p-2 text-left text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="border-b border-[rgb(var(--border))]">
                  <td className="p-2 text-sm font-mono">{order.orderNumber}</td>
                  <td className="p-2 text-sm">{order.customer?.name}</td>
                  <td className="p-2 text-sm">Rp {Number(order.grandTotal).toLocaleString()}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs ${
                        order.orderStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : order.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-2 text-sm text-[rgb(var(--text-muted))]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
