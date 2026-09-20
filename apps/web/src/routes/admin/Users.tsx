import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser } from '@/features/admin/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button, Input, Select, Modal, Card, Badge, Skeleton, EmptyState } from '@/components/ui';
import AreaSearch from '@/components/AreaSearch';

interface UserForm {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
  publisherProfile: {
    address: string;
    provinceId: string;
    provinceName: string;
    cityId: string;
    cityName: string;
    districtId: string;
    districtName: string;
    postalCode: string;
  };
}

const emptyForm: UserForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'PRODUCT_PUBLISHER',
  publisherProfile: { address: '', provinceId: '', provinceName: '', cityId: '', cityName: '', districtId: '', districtName: '', postalCode: '' },
};

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const { data, isLoading } = useUsers(page, search);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isMobile = useIsMobile();

  const isEditing = !!editingUser;

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    const p = user.publisherProfile || {};
    setForm({
      email: user.email,
      password: '',
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.roles?.[0] || 'PRODUCT_PUBLISHER',
      publisherProfile: {
        address: p.address || '',
        provinceId: p.provinceId || '',
        provinceName: p.provinceName || '',
        cityId: p.cityId || '',
        cityName: p.cityName || '',
        districtId: p.districtId || '',
        districtName: p.districtName || '',
        postalCode: p.postalCode || '',
      },
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const payload: any = {
        fullName: form.fullName,
        phone: form.phone,
      };
      if (form.role === 'PRODUCT_PUBLISHER') {
        payload.publisherProfile = form.publisherProfile;
      }
      updateUser.mutate({ id: editingUser.id, data: payload }, {
        onSuccess: () => { setShowModal(false); setEditingUser(null); },
      });
    } else {
      createUser.mutate(form, {
        onSuccess: () => { setShowModal(false); setForm(emptyForm); },
      });
    }
  };

  const handleAreaSelect = (area: any) => {
    setForm({
      ...form,
      publisherProfile: {
        ...form.publisherProfile,
        provinceId: area.province_id || area.id || '',
        provinceName: area.province_name || '',
        cityId: area.city_id || area.id || '',
        cityName: area.city_name || '',
        districtId: area.district_id || area.id || '',
        districtName: area.district_name || '',
        postalCode: area.zip_code || '',
      },
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Users</h1>
        <Button onClick={openCreate}>Add User</Button>
      </div>

      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 max-w-md"
      />

      <Modal open={showModal} onClose={closeModal} title={isEditing ? 'Edit User' : 'Create User'}>
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
            disabled={isEditing}
          />
          {!isEditing && (
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          )}
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {!isEditing && (
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'PRODUCT_PUBLISHER', label: 'Product Publisher' },
                { value: 'ADMIN_MAKER', label: 'Admin Maker' },
              ]}
            />
          )}

          {form.role === 'PRODUCT_PUBLISHER' && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-sm mb-3">Publisher Address</h4>
              <div className="space-y-3">
                <AreaSearch
                  label="Kota / Kecamatan"
                  value={form.publisherProfile.cityName || ''}
                  onSelect={handleAreaSelect}
                />
                <Input
                  label="Postal Code"
                  value={form.publisherProfile.postalCode}
                  onChange={(e) => setForm({
                    ...form,
                    publisherProfile: { ...form.publisherProfile, postalCode: e.target.value },
                  })}
                />
                <Input
                  label="Address (Street, No, RT/RW)"
                  value={form.publisherProfile.address}
                  onChange={(e) => setForm({
                    ...form,
                    publisherProfile: { ...form.publisherProfile, address: e.target.value },
                  })}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" loading={createUser.isPending || updateUser.isPending}>
              {isEditing ? 'Save' : 'Create'}
            </Button>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
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
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="accent">{u.roles[0]}</Badge>
                <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
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
                  <th className="p-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((u: any) => (
                  <tr key={u.id} className="border-t border-[rgb(var(--border))]">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3"><Badge variant="accent">{u.roles[0]}</Badge></td>
                    <td className="p-3"><Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>{u.status}</Badge></td>
                    <td className="p-3">
                      <button onClick={() => openEdit(u)} className="text-sm text-blue-600 hover:underline">Edit</button>
                    </td>
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
