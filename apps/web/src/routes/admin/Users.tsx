import { useState } from 'react';
import { useUsers, useCreateUser } from '@/features/admin/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button, Input, Select, Modal, Card, Badge, Skeleton, EmptyState } from '@/components/ui';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'PRODUCT_PUBLISHER' });
  const { data, isLoading } = useUsers(page, search);
  const createUser = useCreateUser();
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(form, {
      onSuccess: () => { setShowCreate(false); setForm({ email: '', password: '', fullName: '', role: 'PRODUCT_PUBLISHER' }); },
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Users</h1>
        <Button onClick={() => setShowCreate(true)}>Add User</Button>
      </div>

      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 max-w-md"
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'PRODUCT_PUBLISHER', label: 'Product Publisher' },
              { value: 'ADMIN_MAKER', label: 'Admin Maker' },
            ]}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" loading={createUser.isPending}>Create</Button>
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data?.users?.length === 0 ? (
        <Card>
          <EmptyState title="No users found" description="Create your first user to get started" />
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {data?.users?.map((u: any) => (
            <Card key={u.id} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-sm text-[rgb(var(--text-muted))]">{u.email}</p>
                </div>
                <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>
                  {u.status}
                </Badge>
              </div>
              <div className="mt-2">
                <Badge variant="accent">{u.roles[0]}</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--bg-secondary))]">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Name</th>
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-left text-sm font-medium">Role</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((u: any) => (
                  <tr key={u.id} className="border-t border-[rgb(var(--border))]">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3"><Badge variant="accent">{u.roles[0]}</Badge></td>
                    <td className="p-3"><Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>{u.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-[rgb(var(--text-muted))]">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(data!.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
