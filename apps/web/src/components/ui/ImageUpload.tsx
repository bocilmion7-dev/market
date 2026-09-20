import { useRef, useState } from 'react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  previewClassName?: string;
}

export default function ImageUpload({ value, onChange, folder = 'general', label = 'Upload Gambar', className = '', previewClassName = '' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/upload?folder=${folder}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onChange(data.data.url);
      } else {
        setError(data.error?.message || 'Upload gagal');
      }
    } catch (err) {
      setError('Upload gagal');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="flex items-start gap-3">
        <div className={`border border-[rgb(var(--border))] rounded-sm overflow-hidden ${previewClassName}`}>
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[rgb(var(--text-muted))] text-xs">
              Belum ada gambar
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-sm hover:bg-[rgb(var(--bg-secondary))] disabled:opacity-50"
          >
            {uploading ? 'Mengupload...' : 'Pilih Gambar'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-2 text-sm text-red-500 hover:text-red-600"
            >
              Hapus
            </button>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-[rgb(var(--text-muted))]">Maks 5MB. JPG, PNG, WebP, GIF.</p>
        </div>
      </div>
    </div>
  );
}
