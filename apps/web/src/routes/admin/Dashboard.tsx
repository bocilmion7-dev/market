export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '—', color: 'bg-blue-500' },
          { label: 'Pending Approval', value: '—', color: 'bg-yellow-500' },
          { label: 'Total Orders', value: '—', color: 'bg-green-500' },
          { label: 'Total Revenue', value: '—', color: 'bg-brand-accent' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4">
            <div className={`h-1 ${card.color} rounded-full mb-3`} />
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
