import { Link } from 'react-router-dom';
import DarkModeToggle from '@/components/DarkModeToggle';
import { Search, ShoppingBag } from 'lucide-react';

export default function TopBar({ siteName = 'Marketplace', onSearchOpen }: { siteName?: string; onSearchOpen?: () => void }) {
  return (
    <header className="md:hidden bg-orange-500">
      <div className="flex items-center gap-3 h-14 px-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-sm bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">{siteName}</span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={onSearchOpen}
          className="text-white p-2 rounded-sm"
        >
          <Search className="w-6 h-6" />
        </button>

        <DarkModeToggle />
      </div>
    </header>
  );
}
