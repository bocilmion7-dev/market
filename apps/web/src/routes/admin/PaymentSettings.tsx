import { useState, useEffect } from 'react';
import { Button, Input, Skeleton, ImageUpload } from '@/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMidtransSettings, useUpdateMidtransSettings } from '@/features/admin/hooks';

export default function PaymentSettings() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useMidtransSettings();
  const updateSettings = useUpdateMidtransSettings();

  const [serverKey, setServerKey] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [isProduction, setIsProduction] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // QRIS state
  const [qrisEnabled, setQrisEnabled] = useState(false);
  const [qrisImageUrl, setQrisImageUrl] = useState('');
  const [qrisLoaded, setQrisLoaded] = useState(false);
  const [qrisSaving, setQrisSaving] = useState(false);

  // WhatsApp state
  const [waNumber, setWaNumber] = useState('');
  const [waLoaded, setWaLoaded] = useState(false);
  const [waSaving, setWaSaving] = useState(false);

  useEffect(() => {
    if (settings && !loaded) {
      setServerKey(settings.serverKey || '');
      setClientKey(settings.clientKey || '');
      setIsProduction(settings.isProduction || false);
      setLoaded(true);
    }
  }, [settings, loaded]);

  useEffect(() => {
    api.get<any>('/admin/settings/qris').then((data) => {
      setQrisEnabled(data.enabled || false);
      setQrisImageUrl(data.qrImageUrl || '');
      setQrisLoaded(true);
    });
  }, []);

  useEffect(() => {
    api.get<any>('/admin/settings/whatsapp').then((data) => {
      setWaNumber(data.phoneNumber || '');
      setWaLoaded(true);
    });
  }, []);

  const handleSaveMidtrans = () => {
    updateSettings.mutate({ serverKey, clientKey, isProduction });
  };

  const handleSaveQris = async () => {
    setQrisSaving(true);
    await api.put('/admin/settings/qris', { enabled: qrisEnabled, qrImageUrl: qrisImageUrl });
    setQrisSaving(false);
    qc.invalidateQueries({ queryKey: ['payment-public-settings'] });
  };

  const handleSaveWhatsapp = async () => {
    setWaSaving(true);
    await api.put('/admin/settings/whatsapp', { phoneNumber: waNumber });
    setWaSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Payment Settings</h1>

      {/* Midtrans */}
      <section className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-2">Midtrans</h2>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
            Dapatkan keys dari <a href="https://dashboard.midtrans.com" target="_blank" rel="noreferrer" className="text-brand-accent underline">dashboard.midtrans.com</a>
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Server Key</label>
            <Input type="password" value={serverKey} onChange={(e) => setServerKey(e.target.value)} placeholder="SB-Mid-server-..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Key</label>
            <Input type="password" value={clientKey} onChange={(e) => setClientKey(e.target.value)} placeholder="SB-Mid-client-..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Environment</label>
            <button onClick={() => setIsProduction(!isProduction)} className={`w-10 h-5 rounded-full transition-colors relative ${isProduction ? 'bg-red-500' : 'bg-brand-accent'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isProduction ? 'translate-x-5' : ''}`} />
            </button>
            <span className="ml-3 text-sm">{isProduction ? 'Production (Live)' : 'Sandbox (Testing)'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSaveMidtrans} loading={updateSettings.isPending}>
            {updateSettings.isPending ? 'Menyimpan...' : 'Simpan Midtrans'}
          </Button>
          {updateSettings.isSuccess && <span className="text-sm text-green-600">Tersimpan!</span>}
        </div>
      </section>

      {/* QRIS */}
      <section className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-2">QRIS Manual</h2>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
            Aktifkan QRIS sebagai metode pembayaran manual. Customer akan melihat gambar QR Code dan mengirim bukti transfer via WhatsApp.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setQrisEnabled(!qrisEnabled)} className={`w-10 h-5 rounded-full transition-colors relative ${qrisEnabled ? 'bg-brand-accent' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${qrisEnabled ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-medium">{qrisEnabled ? 'Aktif' : 'Nonaktif'}</span>
          </div>
          <ImageUpload
            value={qrisImageUrl}
            onChange={setQrisImageUrl}
            folder="qris"
            label="Gambar QRIS"
            previewClassName="w-48 h-48"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSaveQris} loading={qrisSaving}>
            {qrisSaving ? 'Menyimpan...' : 'Simpan QRIS'}
          </Button>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-2">WhatsApp</h2>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
            Nomor WhatsApp untuk menerima bukti pembayaran dari customer.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
          <Input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="6281234567890" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSaveWhatsapp} loading={waSaving}>
            {waSaving ? 'Menyimpan...' : 'Simpan WhatsApp'}
          </Button>
        </div>
      </section>

      <section className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] rounded-sm p-6">
        <h2 className="text-lg font-bold mb-2">Informasi</h2>
        <ul className="text-sm text-[rgb(var(--text-muted))] space-y-1">
          <li>• <strong>Midtrans</strong> — pembayaran otomatis via VA, credit card, e-wallet</li>
          <li>• <strong>QRIS</strong> — pembayaran manual, customer kirim bukti via WhatsApp</li>
          <li>• <strong>WhatsApp</strong> — nomor tujuan kirim bukti pembayaran QRIS</li>
        </ul>
      </section>
    </div>
  );
}
