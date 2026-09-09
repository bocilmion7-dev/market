import { Link } from 'react-router-dom';
import { useUIStore } from '@/stores/ui';
import NotificationBell from '@/components/NotificationBell';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useAuthStore } from '@/stores/auth';

export default function TopBar() {
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
      <div className="flex items-center justify-between h-14 px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="text-lg font-bold">Marketplace</Link>

        <div className="flex items-center gap-1">
          <DarkModeToggle />
          {user && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}
