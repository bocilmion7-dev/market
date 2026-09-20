import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useSiteSettings } from '@/features/admin/hooks';
import BottomTabBar from './BottomTabBar';
import TopBar from './TopBar';
import DarkModeToggle from '@/components/DarkModeToggle';
import NotificationBell from '@/components/NotificationBell';
import OverlaySearch from '@/components/OverlaySearch';
import { Search, ShoppingBag, Megaphone } from 'lucide-react';

function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="bg-brand-accent text-white text-xs overflow-hidden h-7 flex items-center">
      <div className="flex w-max animate-marquee">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="flex items-center gap-1.5 px-8 shrink-0">
            <Megaphone className="w-3 h-3" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className="bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))] mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Social */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-sm bg-brand-accent flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">{siteName}</span>
            </div>
            <p className="text-sm text-[rgb(var(--text-muted))] mb-4 leading-relaxed">
              Marketplace multi-vendor terpercaya. Belanja dari ribuan penjual dengan harga terbaik.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Belanja */}
          <div>
            <h4 className="font-bold mb-4">Belanja</h4>
            <ul className="space-y-2.5">
              <li><Link to="/products" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Semua Produk</Link></li>
              <li><Link to="/products?sort=bestselling" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Terlaris</Link></li>
              <li><Link to="/products?sort=newest" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Terbaru</Link></li>
              <li><Link to="/cart" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Keranjang</Link></li>
              <li><Link to="/wishlist" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 className="font-bold mb-4">Akun</h4>
            <ul className="space-y-2.5">
              <li><Link to="/orders" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Pesanan Saya</Link></li>
              <li><Link to="/login" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Masuk</Link></li>
              <li><a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Daftar</a></li>
              <li><a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Profil Saya</a></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="font-bold mb-4">Bantuan</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Cara Berbelanja</a></li>
              <li><a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Kebijakan Pengembalian</a></li>
              <li><a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-brand-accent transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgb(var(--border))] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[rgb(var(--text-muted))]">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
            <a href="#" className="hover:text-brand-accent transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { data: siteSettings } = useSiteSettings();
  const [searchOpen, setSearchOpen] = useState(false);

  const siteName = siteSettings?.siteName || 'Marketplace';
  const announcementText = siteSettings?.announcementText || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[rgb(var(--bg-secondary))]">
      <div className="sticky top-0 z-40">
        <AnnouncementBar text={announcementText} />
        {isMobile ? (
          <TopBar siteName={siteName} onSearchOpen={() => setSearchOpen(true)} />
        ) : (
          <div className="bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-14">
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm bg-brand-accent flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  {siteName}
                </Link>

                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex-1 max-w-lg mx-8 flex items-center gap-2 px-3 py-1 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] text-sm rounded-sm hover:border-brand-accent/50 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cari produk...</span>
                  <span className="ml-auto text-xs bg-[rgb(var(--bg-tertiary))] px-1.5 py-0.5 rounded">⌘K</span>
                </button>

                <div className="flex items-center gap-1">
                  <Link to="/products" className="px-3 py-1.5 text-sm hover:text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors">Products</Link>
                  <Link to="/cart" className="px-3 py-1.5 text-sm hover:text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors">Cart</Link>
                  <div className="w-px h-5 bg-[rgb(var(--border))] mx-1" />
                  <DarkModeToggle />
                  {user ? (
                    <>
                      <NotificationBell />
                      {user.roles?.includes('ADMIN_MAKER') && <Link to="/admin" className="px-3 py-1.5 text-sm hover:text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors">Admin</Link>}
                      {user.roles?.includes('PRODUCT_PUBLISHER') && <Link to="/publisher" className="px-3 py-1.5 text-sm hover:text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors">Publisher</Link>}
                      <button onClick={() => useAuthStore.getState().logout()} className="px-3 py-1.5 text-sm text-semantic-error hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" className="px-4 py-1.5 text-sm bg-brand-accent text-white rounded-sm hover:bg-brand-accent-dark transition-colors">Login</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
        <Outlet />
      </main>

      <Footer siteName={siteName} />

      {isMobile && <BottomTabBar />}

      <OverlaySearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
