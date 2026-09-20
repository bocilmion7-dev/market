import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AreaResult {
  id: string;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  zip_code: string;
  province_id: string;
  city_id: string;
  district_id: string;
}

interface AreaSearchProps {
  label?: string;
  placeholder?: string;
  value: string;
  onSelect: (area: AreaResult) => void;
  disabled?: boolean;
}

export default function AreaSearch({ label, placeholder = 'Cari kota atau kecamatan...', value, onSelect, disabled }: AreaSearchProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const { data: results = [] } = useQuery<AreaResult[]>({
    queryKey: ['areaSearch', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const res = await api.get<any>(`/shipping/search?q=${encodeURIComponent(query)}`);
      const items = Array.isArray(res) ? res : res?.data || [];
      return items.slice(0, 8);
    },
    enabled: query.length >= 2 && isOpen,
  });

  const handleSelect = (area: AreaResult) => {
    setQuery(area.label);
    setIsOpen(false);
    onSelect(area);
  };

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(var(--color-brand-accent))]"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto mt-1">
          {results.map((area) => (
            <button
              key={area.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(area)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-0"
            >
              <div className="font-medium">{area.label}</div>
              <div className="text-xs text-gray-500">
                {area.district_name}, {area.city_name}, {area.province_name} — {area.zip_code}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
