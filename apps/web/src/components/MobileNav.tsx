import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 bg-brand-dark text-white">
        <Link to="/" className="text-lg font-bold">Marketplace</Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="bg-brand-dark text-white p-4 space-y-4">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 text-brand-dark"
            />
          </form>

          <nav className="space-y-2">
            <Link to="/products" onClick={() => setIsOpen(false)} className="block py-2 hover:text-brand-accent">Products</Link>
            <Link to="/cart" onClick={() => setIsOpen(false)} className="block py-2 hover:text-brand-accent">Cart</Link>
            {user ? (
              <>
                {user.roles?.includes('ADMIN_MAKER') && <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-2 hover:text-brand-accent">Admin</Link>}
                {user.roles?.includes('PRODUCT_PUBLISHER') && <Link to="/publisher" onClick={() => setIsOpen(false)} className="block py-2 hover:text-brand-accent">Publisher</Link>}
                <button onClick={() => { useAuthStore.getState().logout(); setIsOpen(false); }} className="block py-2 text-red-400 hover:text-red-300">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 hover:text-brand-accent">Login</Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
