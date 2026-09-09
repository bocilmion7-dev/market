import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/cn';

interface DrawerLink {
  label: string;
  path: string;
}

interface MobileDrawerProps {
  links: DrawerLink[];
  title: string;
}

export default function MobileDrawer({ links, title }: MobileDrawerProps) {
  const { drawerOpen, setDrawerOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 100) {
      setDrawerOpen(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'md:hidden fixed top-0 left-0 bottom-0 z-50 w-72',
          'bg-[rgb(var(--bg-primary))] shadow-xl',
          'transition-transform duration-250 ease-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 -mr-2 hover:bg-[rgb(var(--bg-tertiary))] touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                'block px-3 py-2.5 text-sm transition-colors touch-target',
                location.pathname === link.path
                  ? 'bg-brand-accent text-white'
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgb(var(--border))]">
            <p className="text-sm text-[rgb(var(--text-muted))] mb-2">{user.email}</p>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                setDrawerOpen(false);
              }}
              className="text-sm text-semantic-error hover:text-red-600 touch-target"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
