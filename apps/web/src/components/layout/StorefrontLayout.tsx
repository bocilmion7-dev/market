import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useSiteSettings } from '@/features/admin/hooks';
import BottomTabBar from './BottomTabBar';
import TopBar from './TopBar';
import DarkModeToggle from '@/components/DarkModeToggle';
import NotificationBell from '@/components/NotificationBell';

const shippingLogos = [
  { name: 'JNE', url: 'https://logo.clearbit.com/jne.co.id', color: '#006CB7' },
  { name: 'J&T', url: 'https://logo.clearbit.com/jtexpress.co.id', color: '#E31E24' },
  { name: 'SiCepat', url: 'https://logo.clearbit.com/sicepat.com', color: '#FF6600' },
  { name: 'AnterAja', url: 'https://logo.clearbit.com/anteraja.com', color: '#00A651' },
  { name: 'Tiki', url: 'https://logo.clearbit.com/tiki.id', color: '#006CB7' },
  { name: 'Wahana', url: 'https://logo.clearbit.com/wahana.com', color: '#004B87' },
  { name: 'Pos', url: 'https://logo.clearbit.com/posindonesia.co.id', color: '#ED1C24' },
  { name: 'Ninja', url: 'https://logo.clearbit.com/ninjalogistics.co.id', color: '#00B14F' },
];

const paymentLogos = [
  { name: 'BCA', url: 'https://logo.clearbit.com/bca.co.id', color: '#0060A9' },
  { name: 'Mandiri', url: 'https://logo.clearbit.com/bankmandiri.co.id', color: '#003D6B' },
  { name: 'BRI', url: 'https://logo.clearbit.com/bri.co.id', color: '#004B87' },
  { name: 'BNI', url: 'https://logo.clearbit.com/bni.co.id', color: '#D71920' },
  { name: 'BSI', url: 'https://logo.clearbit.com/bsi.co.id', color: '#00529B' },
  { name: 'CIMB', url: 'https://logo.clearbit.com/cimbniaga.co.id', color: '#7B2D26' },
  { name: 'Danamon', url: 'https://logo.clearbit.com/danamon.co.id', color: '#006CB7' },
  { name: 'Permata', url: 'https://logo.clearbit.com/permatabank.co.id', color: '#ED1C24' },
  { name: 'Maybank', url: 'https://logo.clearbit.com/maybank.co.id', color: '#FFCC00' },
  { name: 'QRIS', url: 'https://logo.clearbit.com/bi.go.id', color: '#003D6B' },
  { name: 'Gopay', url: 'https://logo.clearbit.com/gopay.co.id', color: '#00AA13' },
  { name: 'OVO', url: 'https://logo.clearbit.com/ovo.id', color: '#4C3494' },
  { name: 'ShopeePay', url: 'https://logo.clearbit.com/shopee.co.id', color: '#EE4D2D' },
  { name: 'Dana', url: 'https://logo.clearbit.com/dana.id', color: '#108EE9' },
];

function CourierLogo({ logo }: { logo: { name: string; url: string; color: string } }) {
  const [error, setError] = useState(false);

  return (
    <div className="w-[72px] h-[42px] flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow px-2">
      {error ? (
        <span className="text-[11px] font-bold" style={{ color: logo.color }}>{logo.name}</span>
      ) : (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-7 max-w-full object-contain"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

function PaymentLogo({ logo }: { logo: { name: string; url: string; color: string } }) {
  const [error, setError] = useState(false);

  return (
    <div className="w-[60px] h-[36px] flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow px-1.5">
      {error ? (
        <span className="text-[9px] font-bold" style={{ color: logo.color }}>{logo.name}</span>
      ) : (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-6 max-w-full object-contain"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))] mt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h4 className="text-sm font-bold text-[rgb(var(--text-primary))]">Pengiriman Dukungan</h4>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {shippingLogos.map((logo) => (
              <CourierLogo key={logo.name} logo={logo} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h4 className="text-sm font-bold text-[rgb(var(--text-primary))]">Metode Pembayaran</h4>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {paymentLogos.map((logo) => (
              <PaymentLogo key={logo.name} logo={logo} />
            ))}
          </div>
        </div>

        <div className="border-t border-[rgb(var(--border))] pt-4 text-center text-xs text-[rgb(var(--text-muted))]">
          <p>&copy; {new Date().getFullYear()} Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();
  const { data: siteSettings } = useSiteSettings();

  const siteName = siteSettings?.siteName || 'Marketplace';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[rgb(var(--bg-secondary))]">
      {isMobile ? (
        <TopBar siteName={siteName} />
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
                    <button onClick={() => useAuthStore.getState().logout()} className="text-sm text-semantic-error hover:text-red-600 rounded-sm">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="text-sm hover:text-brand-accent">Login</Link>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
        <Outlet />
      </main>

      <Footer />

      {isMobile && <BottomTabBar />}
    </div>
  );
}
