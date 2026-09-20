import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  marketplacePrice: number;
  media?: { url: string }[];
  category?: { name: string };
}

interface OverlaySearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OverlaySearch({ isOpen, onClose }: OverlaySearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['searchProducts', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const data = await api.get<any>(`/products?search=${encodeURIComponent(query)}&limit=8`);
      return data.products || [];
    },
    enabled: query.length >= 2,
  });

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgb(var(--bg-primary))] animate-fade-in-down">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari produk, kategori, atau merek..."
              className="w-full pl-12 pr-4 py-3 text-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
            />
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-[rgb(var(--bg-tertiary))] rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {query.length < 2 && recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-[rgb(var(--text-muted))]" />
                Pencarian Terakhir
              </h3>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-[rgb(var(--text-muted))] hover:text-brand-accent"
              >
                Hapus Semua
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="px-3 py-1.5 text-sm bg-[rgb(var(--bg-tertiary))] rounded-sm hover:bg-brand-accent/10 hover:text-brand-accent transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.length >= 2 && (
          <div>
            {isLoading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-[rgb(var(--bg-tertiary))] rounded-sm" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[rgb(var(--bg-tertiary))] rounded w-3/4" />
                      <div className="h-3 bg-[rgb(var(--bg-tertiary))] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-accent" />
                  Hasil Pencarian
                </h3>
                <div className="space-y-2">
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        handleSearch(query);
                        navigate(`/products/${product.slug}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors text-left"
                    >
                      <div className="w-16 h-16 flex-shrink-0 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center overflow-hidden rounded-sm">
                        {product.media?.[0]?.url ? (
                          <img src={product.media[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-[rgb(var(--text-muted))]">No img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{product.category?.name}</p>
                        <p className="text-sm font-bold text-brand-accent mt-1">
                          Rp {Number(product.marketplacePrice).toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[rgb(var(--text-muted))] flex-shrink-0" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full mt-4 py-3 text-sm font-medium text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  Lihat semua hasil untuk "{query}"
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-[rgb(var(--text-muted))] mb-4" />
                <p className="text-[rgb(var(--text-muted))]">Tidak ada hasil untuk "{query}"</p>
                <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Coba kata kunci lain</p>
              </div>
            )}
          </div>
        )}

        {query.length < 2 && !recentSearches.length && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-[rgb(var(--text-muted))] mb-4" />
            <p className="text-[rgb(var(--text-muted))]">Mulai mengetik untuk mencari produk</p>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Minimal 2 karakter</p>
          </div>
        )}
      </div>
    </div>
  );
}
