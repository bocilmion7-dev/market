import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useSiteSettings } from '@/features/admin/hooks';
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

function Footer({ siteFooter, siteName }: { siteFooter: any; siteName: string }) {
  return (
    <footer className="bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">{siteName}</h3>
            {siteFooter?.description && <p className="text-sm text-[rgb(var(--text-muted))]">{siteFooter.description}</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-[rgb(var(--text-muted))]">
              {siteFooter?.address && <p>{siteFooter.address}</p>}
              {siteFooter?.phone && <p>Telp: {siteFooter.phone}</p>}
              {siteFooter?.email && <p>Email: {siteFooter.email}</p>}
            </div>
            {siteFooter?.mapUrl && (
              <a href={siteFooter.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-brand-accent text-sm hover:underline">
                View on Google Maps →
              </a>
            )}
          </div>
          <div>
            {siteFooter?.mapEmbedUrl ? (
              <iframe src={siteFooter.mapEmbedUrl} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center text-[rgb(var(--text-muted))] text-sm">
                Map not configured
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-[rgb(var(--border))] mt-6 pt-6 text-center text-sm text-[rgb(var(--text-muted))]">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();
  const { data: siteSettings } = useSiteSettings();

  const siteName = siteSettings?.siteName || 'Marketplace';
  const siteFooter = siteSettings?.siteFooter;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-[100dvh] bg-[rgb(var(--bg-secondary))]">
      {isMobile ? (
        <>
          <TopBar siteName={siteName} />
          <MobileDrawer links={secondaryLinks} title="Menu" />
        </>
      ) : (
        <header className="bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold">{siteName}</Link>

              <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-brand-accent"
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

      {!isMobile && <Footer siteFooter={siteFooter} siteName={siteName} />}

      {isMobile && <BottomTabBar />}
    </div>
  );
}
