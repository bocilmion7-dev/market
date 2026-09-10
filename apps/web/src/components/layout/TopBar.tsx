import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function TopBar({ siteName = 'Marketplace' }: { siteName?: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setShowSearch(false);
      setSearch('');
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-orange-500">
      <div className="flex items-center gap-3 h-14 px-4">
        <Link to="/" className="text-lg font-bold text-white flex-shrink-0">{siteName}</Link>

        <div className="flex-1" />

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-white p-2 rounded-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <DarkModeToggle />
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            autoFocus
            className="w-full px-3 py-2 text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </form>
      )}
    </header>
  );
}
