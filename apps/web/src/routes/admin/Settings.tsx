import { useState, useEffect } from 'react';
import { useSettings, useUpdateAdminFee, useBanners, useUpdateBanners } from '@/features/admin/hooks';

let bannerIdCounter = Date.now();
function newId() { return String(bannerIdCounter++); }

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateAdminFee = useUpdateAdminFee();
  const [fee, setFee] = useState(10);

  const { data: bannersData } = useBanners();
  const updateBanners = useUpdateBanners();
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    if (settings?.admin_fee_percentage) setFee(settings.admin_fee_percentage.percentage);
  }, [settings]);

  useEffect(() => {
    if (bannersData) setBanners(bannersData.map((b: any) => ({ ...b, id: b.id || newId() })));
  }, [bannersData]);

  const handleSaveFee = () => updateAdminFee.mutate(fee);

  const handleSaveBanners = () => {
    updateBanners.mutate(banners);
  };

  const addBanner = () => {
    if (banners.length >= 5) return;
    setBanners([...banners, { id: newId(), title: '', subtitle: '', imageUrl: '', link: '', active: true }]);
  };

  const updateBanner = (idx: number, field: string, value: any) => {
    const updated = [...banners];
    updated[idx] = { ...updated[idx], [field]: value };
    setBanners(updated);
  };

  const removeBanner = (idx: number) => {
    setBanners(banners.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Admin Fee */}
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Admin Fee</h2>
        <div className="flex items-center gap-2">
          <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} min={0} max={100} className="border rounded px-3 py-2 w-24" />
          <span className="text-gray-500">%</span>
          <button onClick={handleSaveFee} className="bg-brand-accent text-white px-4 py-2 rounded-lg ml-auto">Save</button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Marketplace Price = Best Price + (Best Price × Fee%)</p>
      </div>

      {/* Home Banners */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Home Banner Slides (max 5)</h2>
          <button onClick={addBanner} disabled={banners.length >= 5} className="bg-brand-accent text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">+ Add Banner</button>
        </div>

        <div className="space-y-4">
          {banners.map((b, idx) => (
            <div key={b.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Banner {idx + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={b.active} onChange={(e) => updateBanner(idx, 'active', e.target.checked)} />
                    Active
                  </label>
                  <button onClick={() => removeBanner(idx)} className="text-red-500 text-sm">Remove</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Title" value={b.title} onChange={(e) => updateBanner(idx, 'title', e.target.value)} className="border rounded px-3 py-2 text-sm" />
                <input placeholder="Subtitle" value={b.subtitle} onChange={(e) => updateBanner(idx, 'subtitle', e.target.value)} className="border rounded px-3 py-2 text-sm" />
                <input placeholder="Image URL" value={b.imageUrl} onChange={(e) => updateBanner(idx, 'imageUrl', e.target.value)} className="border rounded px-3 py-2 text-sm" />
                <input placeholder="Link (optional, e.g. /products?categoryId=...)" value={b.link} onChange={(e) => updateBanner(idx, 'link', e.target.value)} className="border rounded px-3 py-2 text-sm" />
              </div>
              {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="h-20 rounded object-cover" />}
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-gray-400">No banners. Click "Add Banner" to create one.</p>}
        </div>

        <button onClick={handleSaveBanners} disabled={updateBanners.isPending} className="mt-4 bg-brand-accent text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {updateBanners.isPending ? 'Saving...' : 'Save Banners'}
        </button>
      </div>
    </div>
  );
}
