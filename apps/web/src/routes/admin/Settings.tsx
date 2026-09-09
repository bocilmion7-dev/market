import { useState, useEffect } from 'react';
import { useSettings, useUpdateAdminFee } from '@/features/admin/hooks';

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateAdminFee = useUpdateAdminFee();
  const [fee, setFee] = useState(10);

  useEffect(() => {
    if (settings?.admin_fee_percentage) {
      setFee(settings.admin_fee_percentage.percentage);
    }
  }, [settings]);

  const handleSave = () => {
    updateAdminFee.mutate(fee);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Admin Fee</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            min={0}
            max={100}
            className="border rounded px-3 py-2 w-24"
          />
          <span className="text-gray-500">%</span>
          <button onClick={handleSave} className="bg-brand-accent text-white px-4 py-2 rounded-lg ml-auto">
            Save
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Marketplace Price = Best Price + (Best Price × Fee%)</p>
      </div>
    </div>
  );
}
