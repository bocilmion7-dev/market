import { useState } from 'react';
import { useUsers, useCreateUser } from '@/features/admin/hooks';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'PRODUCT_PUBLISHER' });
  const { data, isLoading } = useUsers(page, search);
  const createUser = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(form, {
      onSuccess: () => { setShowCreate(false); setForm({ email: '', password: '', fullName: '', role: 'PRODUCT_PUBLISHER' }); },
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => setShowCreate(true)} className="bg-brand-accent text-white px-4 py-2 rounded-lg hover:bg-brand-accent-dark">
          Add User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="border rounded-lg px-3 py-2 mb-4 w-full max-w-md"
      />

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create User</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="PRODUCT_PUBLISHER">Product Publisher</option>
                <option value="ADMIN_MAKER">Admin Maker</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="bg-brand-accent text-white px-4 py-2 rounded-lg">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="border px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-dark text-white">
            <tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : data?.users?.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No users found</td></tr>
            ) : (
              data?.users?.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3"><span className="bg-brand-accent/10 text-brand-accent px-2 py-1 rounded text-sm">{u.roles[0]}</span></td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-sm ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data?.totalPages > 1 && (
          <div className="flex justify-between items-center p-3 border-t">
            <span className="text-sm text-gray-500">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
