import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import BottomTabBar from './BottomTabBar';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';
import DarkModeToggle from '@/components/DarkModeToggle';
import NotificationBell from '@/components/NotificationBell';

const secondaryLinks = [
  { label: 'Products', path: '/products' },
  { label: 'My Orders', path: '/orders' },
  { label: 'Wishlist', path: '/wishlist' },
];

export default function StorefrontLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-[100dvh] bg-[rgb(var(--bg-secondary))]">
      {isMobile ? (
        <>
          <TopBar />
          <MobileDrawer links={secondaryLinks} title="Menu" />
        </>
      ) : (
        <header className="bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold">Marketplace</Link>

              <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </form>

              <div className="flex items-center gap-4">
                <Link to="/products" className="text-sm hover:text-brand-accent">Products</Link>
                <Link to="/cart" className="text-sm hover:text-brand-accent">Cart</Link>
                <DarkModeToggle />
                {user ? (
                  <>
                    <NotificationBell />
                    {user.roles?.includes('ADMIN_MAKER') && <Link to="/admin" className="text-sm hover:text-brand-accent">Admin</Link>}
                    {user.roles?.includes('PRODUCT_PUBLISHER') && <Link to="/publisher" className="text-sm hover:text-brand-accent">Publisher</Link>}
                    <button onClick={() => useAuthStore.getState().logout()} className="text-sm text-semantic-error hover:text-red-600">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="text-sm hover:text-brand-accent">Login</Link>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={isMobile ? 'pb-20' : ''}>
        <Outlet />
      </main>

      {!isMobile && (
        <footer className="bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))] mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[rgb(var(--text-muted))]">
            <p>Marketplace — Multi-Publisher Platform</p>
          </div>
        </footer>
      )}

      {isMobile && <BottomTabBar />}
    </div>
  );
}
