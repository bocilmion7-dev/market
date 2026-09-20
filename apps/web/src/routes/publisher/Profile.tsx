import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import AreaSearch, { type AreaResult } from '@/components/AreaSearch';
import { Button, Input, Skeleton } from '@/components/ui';

interface PublisherProfile {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  postalCode: string | null;
}

export default function PublisherProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useQuery<PublisherProfile>({
    queryKey: ['publisherProfile'],
    queryFn: () => api.get('/publisher/profile'),
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [cityId, setCityId] = useState('');
  const [cityName, setCityName] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setProvinceId(profile.provinceId || '');
      setProvinceName(profile.provinceName || '');
      setCityId(profile.cityId || '');
      setCityName(profile.cityName || '');
      setDistrictId(profile.districtId || '');
      setDistrictName(profile.districtName || '');
      setPostalCode(profile.postalCode || '');
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('/publisher/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publisherProfile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      if (user) {
        setUser({ ...user, publisherProfileComplete: true });
      }
      alert('Profil berhasil diperbarui');
      navigate('/publisher');
    },
  });

  const handleAreaSelect = (area: AreaResult) => {
    setProvinceId(area.province_id);
    setProvinceName(area.province_name);
    setCityId(area.city_id);
    setCityName(area.city_name);
    setDistrictId(area.district_id);
    setDistrictName(area.district_name);
    setPostalCode(area.zip_code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      fullName,
      phone,
      address,
      provinceId,
      provinceName,
      cityId,
      cityName,
      districtId,
      districtName,
      postalCode,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Profil Publisher</h1>
      <p className="text-sm text-[rgb(var(--text-muted))] mb-6">
        Lengkapi profil Anda untuk dapat mulai berjualan. Semua field wajib diisi.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">No. HP</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(var(--color-brand-accent))]"
            rows={3}
            placeholder="Jalan, nomor, RT/RW..."
            required
          />
        </div>

        <AreaSearch
          label="Provinsi / Kota / Kecamatan / Kode Pos"
          placeholder="Cari kota atau kecamatan..."
          value={provinceId ? `${districtName}, ${cityName}, ${provinceName} — ${postalCode}` : ''}
          onSelect={handleAreaSelect}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provinsi</label>
            <Input value={provinceName} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kota</label>
            <Input value={cityName} disabled />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kecamatan</label>
            <Input value={districtName} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kode Pos</label>
            <Input value={postalCode} disabled />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </div>
      </form>
    </div>
  );
}
