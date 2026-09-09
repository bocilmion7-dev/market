import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import NotificationBell from '@/components/NotificationBell';
import MobileNav from '@/components/MobileNav';

export default function StorefrontLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-brand-muted">
      <MobileNav />
      <header className="bg-brand-dark text-white sticky top-0 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold">Marketplace</Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg text-brand-dark"
              />
            </form>

            <div className="flex items-center gap-4">
              <Link to="/products" className="text-sm hover:text-brand-accent">Products</Link>
              <Link to="/cart" className="text-sm hover:text-brand-accent">Cart</Link>
              {user ? (
                <>
                  <NotificationBell />
                  {user.roles?.includes('ADMIN_MAKER') && <Link to="/admin" className="text-sm hover:text-brand-accent">Admin</Link>}
                  {user.roles?.includes('PRODUCT_PUBLISHER') && <Link to="/publisher" className="text-sm hover:text-brand-accent">Publisher</Link>}
                  <button onClick={() => useAuthStore.getState().logout()} className="text-sm text-red-400 hover:text-red-300">Logout</button>
                </>
              ) : (
                <Link to="/login" className="text-sm hover:text-brand-accent">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-brand-dark text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>Marketplace — Multi-Publisher Platform</p>
        </div>
      </footer>
    </div>
  );
}
