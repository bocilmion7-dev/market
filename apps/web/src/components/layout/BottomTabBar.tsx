import { Link, useLocation } from 'react-router-dom';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/cn';
import { useState, useEffect, createContext, useContext } from 'react';
import { useCart } from '@/features/cart/hooks';
import { useWishlist } from '@/features/wishlist/hooks';

const BottomTabBarVisibleContext = createContext(true);
export function useBottomTabBarVisible() { return useContext(BottomTabBarVisibleContext); }

const tabs = [
  { path: '/', label: 'Home', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { path: '/products', label: 'Cari', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )},
  { path: '/wishlist', label: 'Wishlist', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ), showBadge: true, badgeType: 'wishlist' as const},
  { path: '/cart', label: 'Cart', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ), showBadge: true, badgeType: 'cart' as const},
  { path: '/orders', label: 'Tracking', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )},
];

export default function BottomTabBar() {
  const location = useLocation();
  const scrollDirection = useScrollDirection();
  const isHidden = scrollDirection === 'down' && window.scrollY > 100;
  const [visible, setVisible] = useState(true);
  const { data: cartItems = [] } = useCart();
  const { data: wishlistItems = [] } = useWishlist();

  useEffect(() => {
    setVisible(!isHidden);
  }, [isHidden]);

  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0;
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  return (
    <BottomTabBarVisibleContext.Provider value={visible}>
      <nav
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-40',
          'bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border))]',
          'transition-transform duration-300',
          isHidden ? 'translate-y-full' : 'translate-y-0'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
            const badgeCount = tab.badgeType === 'cart' ? cartCount : tab.badgeType === 'wishlist' ? wishlistCount : 0;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full touch-target relative',
                  isActive ? 'text-brand-accent' : 'text-[rgb(var(--text-muted))]'
                )}
              >
                <div className="relative">
                  {tab.icon(isActive)}
                  {tab.showBadge && badgeCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </BottomTabBarVisibleContext.Provider>
  );
}
