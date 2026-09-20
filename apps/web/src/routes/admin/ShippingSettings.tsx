import { useState, useEffect } from 'react';
import { Button, Input, Skeleton } from '@/components/ui';
import { useShippingProviders, useUpdateShippingProviders, useActiveCouriers, useUpdateActiveCouriers } from '@/features/admin/hooks';

const AVAILABLE_COURIERS = [
  { code: 'jne', name: 'JNE' },
  { code: 'jnt', name: 'J&T' },
  { code: 'sicepat', name: 'SiCepat' },
  { code: 'anteraja', name: 'AnterAja' },
  { code: 'tiki', name: 'TIKI' },
  { code: 'pos', name: 'POS' },
  { code: 'wahana', name: 'Wahana' },
  { code: 'ninja', name: 'Ninja Xpress' },
  { code: 'lion', name: 'Lion Parcel' },
];

export default function ShippingSettings() {
  const { data: providers, isLoading: loadingProviders } = useShippingProviders();
  const { data: couriers, isLoading: loadingCouriers } = useActiveCouriers();
  const updateProviders = useUpdateShippingProviders();
  const updateCouriers = useUpdateActiveCouriers();

  const [localProviders, setLocalProviders] = useState<any[]>([]);
  const [localCouriers, setLocalCouriers] = useState<any[]>([]);

  useEffect(() => {
    if (providers) setLocalProviders(providers);
  }, [providers]);

  useEffect(() => {
    if (couriers) setLocalCouriers(couriers);
  }, [couriers]);

  const handleToggleProvider = (providerId: string) => {
    setLocalProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleUpdateApiKey = (providerId: string, apiKey: string) => {
    setLocalProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, apiKey } : p))
    );
  };

  const handleToggleCourierProvider = (courierCode: string, providerId: string) => {
    setLocalCouriers((prev) =>
      prev.map((c) => {
        if (c.code !== courierCode) return c;
        const providers = c.providers.includes(providerId)
          ? c.providers.filter((p: string) => p !== providerId)
          : [...c.providers, providerId];
        return { ...c, providers };
      })
    );
  };

  const handleAddCourier = (code: string) => {
    if (localCouriers.find((c) => c.code === code)) return;
    const name = AVAILABLE_COURIERS.find((c) => c.code === code)?.name || code;
    setLocalCouriers((prev) => [...prev, { code, name, providers: [] }]);
  };

  const handleRemoveCourier = (code: string) => {
    setLocalCouriers((prev) => prev.filter((c) => c.code !== code));
  };

  const handleSaveProviders = () => {
    updateProviders.mutate(localProviders);
  };

  const handleSaveCouriers = () => {
    updateCouriers.mutate(localCouriers);
  };

  if (loadingProviders || loadingCouriers) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const enabledProviderIds = localProviders.filter((p) => p.enabled).map((p: any) => p.id);

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Shipping Settings</h1>

      <section>
        <h2 className="text-lg font-bold mb-4">Provider</h2>
        <div className="space-y-4">
          {localProviders.map((provider: any) => (
            <div
              key={provider.id}
              className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleProvider(provider.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      provider.enabled ? 'bg-brand-accent' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        provider.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <span className="font-medium">{provider.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-sm ${provider.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {provider.enabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              {provider.enabled && (
                <div>
                  <label className="block text-sm text-[rgb(var(--text-muted))] mb-1">API Key</label>
                  <Input
                    type="password"
                    value={provider.apiKey}
                    onChange={(e) => handleUpdateApiKey(provider.id, e.target.value)}
                    placeholder={`Masukkan API key ${provider.name}...`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Button onClick={handleSaveProviders} loading={updateProviders.isPending} className="mt-4">
          Simpan Provider
        </Button>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Kurir Aktif</h2>
        <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
          Pilih kurir yang tersedia dan tentukan provider mana yang mendukungnya.
        </p>
        <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]">
                <th className="text-left px-4 py-3 font-medium">Kurir</th>
                {localProviders.filter((p: any) => p.enabled).map((p: any) => (
                  <th key={p.id} className="text-center px-4 py-3 font-medium">{p.name}</th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {localCouriers.map((courier: any) => (
                <tr key={courier.code} className="border-b border-[rgb(var(--border))] last:border-0">
                  <td className="px-4 py-3 font-medium">{courier.name}</td>
                  {localProviders.filter((p: any) => p.enabled).map((p: any) => (
                    <td key={p.id} className="text-center px-4 py-3">
                      <button
                        onClick={() => handleToggleCourierProvider(courier.code, p.id)}
                        className={`w-8 h-8 rounded-sm border ${
                          courier.providers.includes(p.id)
                            ? 'bg-brand-accent text-white border-brand-accent'
                            : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent'
                        }`}
                      >
                        {courier.providers.includes(p.id) ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveCourier(courier.code)}
                      className="text-semantic-error hover:text-red-600 text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <select
            id="add-courier"
            className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-sm bg-[rgb(var(--bg-primary))]"
            defaultValue=""
          >
            <option value="" disabled>Tambah kurir...</option>
            {AVAILABLE_COURIERS.filter((c) => !localCouriers.find((lc) => lc.code === c.code)).map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => {
              const select = document.getElementById('add-courier') as HTMLSelectElement;
              if (select.value) {
                handleAddCourier(select.value);
                select.value = '';
              }
            }}
          >
            Tambah
          </Button>
        </div>

        <Button onClick={handleSaveCouriers} loading={updateCouriers.isPending} className="mt-4">
          Simpan Kurir
        </Button>
      </section>
    </div>
  );
}
