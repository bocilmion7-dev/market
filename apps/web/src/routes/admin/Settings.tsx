import { useState, useEffect } from 'react';
import { useSettings, useUpdateAdminFee, useBanners, useUpdateBanners, useUpdateSiteName, useUpdateSiteFooter } from '@/features/admin/hooks';

let bannerIdCounter = Date.now();
function newId() { return String(bannerIdCounter++); }

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateAdminFee = useUpdateAdminFee();
  const [fee, setFee] = useState(10);

  const { data: bannersData } = useBanners();
  const updateBanners = useUpdateBanners();
  const [banners, setBanners] = useState<any[]>([]);

  const updateSiteName = useUpdateSiteName();
  const [siteName, setSiteName] = useState('Marketplace');
  const [siteNameLoaded, setSiteNameLoaded] = useState(false);

  const updateSiteFooter = useUpdateSiteFooter();
  const [footer, setFooter] = useState({ address: '', phone: '', email: '', mapUrl: '', mapEmbedUrl: '', description: '' });
  const [footerLoaded, setFooterLoaded] = useState(false);

  useEffect(() => {
    if (settings?.admin_fee_percentage) setFee(settings.admin_fee_percentage.percentage);
    if (settings?.site_name?.name && !siteNameLoaded) { setSiteName(settings.site_name.name); setSiteNameLoaded(true); }
    if (settings?.site_footer && !footerLoaded) { setFooter(settings.site_footer); setFooterLoaded(true); }
  }, [settings, siteNameLoaded, footerLoaded]);

  useEffect(() => {
    if (bannersData) setBanners(bannersData.map((b: any) => ({ ...b, id: b.id || newId() })));
  }, [bannersData]);

  const handleSaveFee = () => updateAdminFee.mutate(fee);
  const handleSaveSiteName = () => updateSiteName.mutate(siteName);
  const handleSaveFooter = () => updateSiteFooter.mutate(footer);

  const handleSaveBanners = () => updateBanners.mutate(banners);
  const addBanner = () => { if (banners.length < 5) setBanners([...banners, { id: newId(), title: '', subtitle: '', imageUrl: '', link: '', active: true }]); };
  const updateBanner = (idx: number, field: string, value: any) => { const u = [...banners]; u[idx] = { ...u[idx], [field]: value }; setBanners(u); };
  const removeBanner = (idx: number) => setBanners(banners.filter((_, i) => i !== idx));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Site Name */}
      <div className="bg-white shadow p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Site Name</h2>
        <div className="flex items-center gap-2">
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="border px-3 py-2 flex-1" />
          <button onClick={handleSaveSiteName} disabled={updateSiteName.isPending} className="bg-brand-accent text-white px-4 py-2 disabled:opacity-50 rounded-sm">
            {updateSiteName.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Admin Fee */}
      <div className="bg-white shadow p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Admin Fee</h2>
        <div className="flex items-center gap-2">
          <input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} min={0} max={100} className="border px-3 py-2 w-24" />
          <span className="text-gray-500">%</span>
          <button onClick={handleSaveFee} className="bg-brand-accent text-white px-4 py-2 ml-auto rounded-sm">Save</button>
        </div>
      </div>

      {/* Site Footer */}
      <div className="bg-white shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Footer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className="border px-3 py-2 w-full h-20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className="border px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={footer.email} onChange={(e) => setFooter({ ...footer, email: e.target.value })} className="border px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Google Maps URL</label>
            <input value={footer.mapUrl} onChange={(e) => setFooter({ ...footer, mapUrl: e.target.value })} className="border px-3 py-2 w-full" placeholder="https://maps.google.com/..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Google Maps Embed URL</label>
            <input value={footer.mapEmbedUrl} onChange={(e) => setFooter({ ...footer, mapEmbedUrl: e.target.value })} className="border px-3 py-2 w-full" placeholder="https://www.google.com/maps/embed?..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} className="border px-3 py-2 w-full h-20" />
          </div>
        </div>
        <button onClick={handleSaveFooter} disabled={updateSiteFooter.isPending} className="mt-4 bg-brand-accent text-white px-4 py-2 disabled:opacity-50 rounded-sm">
          {updateSiteFooter.isPending ? 'Saving...' : 'Save Footer'}
        </button>
      </div>

      {/* Banners */}
      <div className="bg-white shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Home Banner Slides (max 5)</h2>
          <button onClick={addBanner} disabled={banners.length >= 5} className="bg-brand-accent text-white px-3 py-1.5 text-sm disabled:opacity-50 rounded-sm">+ Add Banner</button>
        </div>
        <div className="space-y-4">
          {banners.map((b, idx) => (
            <div key={b.id} className="border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Banner {idx + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={b.active} onChange={(e) => updateBanner(idx, 'active', e.target.checked)} /> Active
                  </label>
                  <button onClick={() => removeBanner(idx)} className="text-red-500 text-sm rounded-sm">Remove</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Title" value={b.title} onChange={(e) => updateBanner(idx, 'title', e.target.value)} className="border px-3 py-2 text-sm" />
                <input placeholder="Subtitle" value={b.subtitle} onChange={(e) => updateBanner(idx, 'subtitle', e.target.value)} className="border px-3 py-2 text-sm" />
                <input placeholder="Image URL" value={b.imageUrl} onChange={(e) => updateBanner(idx, 'imageUrl', e.target.value)} className="border px-3 py-2 text-sm" />
                <input placeholder="Link (e.g. /products?categoryId=...)" value={b.link} onChange={(e) => updateBanner(idx, 'link', e.target.value)} className="border px-3 py-2 text-sm" />
              </div>
              {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="h-20 object-cover" />}
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-gray-400">No banners yet.</p>}
        </div>
        <button onClick={handleSaveBanners} disabled={updateBanners.isPending} className="mt-4 bg-brand-accent text-white px-4 py-2 text-sm disabled:opacity-50 rounded-sm">
          {updateBanners.isPending ? 'Saving...' : 'Save Banners'}
        </button>
      </div>
    </div>
  );
}
