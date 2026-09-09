import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/features/auth/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/ui';
import MobileDrawer from './MobileDrawer';
import DarkModeToggle from '@/components/DarkModeToggle';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Brands', path: '/admin/brands' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'Form Builder', path: '/admin/form-builder' },
  { label: 'Approvals', path: '/admin/approvals' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Audit Logs', path: '/admin/audit-logs' },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const location = useLocation();
  const isMobile = useIsMobile();
  const setDrawerOpen = useUIStore((s) => s.setDrawerOpen);

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] bg-[rgb(var(--bg-secondary))]">
        <MobileDrawer links={navItems} title="Admin" />
        
        <header className="sticky top-0 z-30 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -ml-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg touch-target"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Admin</h1>
            <DarkModeToggle />
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[rgb(var(--bg-primary))] border-r border-[rgb(var(--border))] text-[rgb(var(--text-primary))] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--border))]">
          <h1 className="text-lg font-bold">Marketplace Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-accent text-white'
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[rgb(var(--border))]">
          <p className="text-xs text-[rgb(var(--text-muted))] mb-2">{user?.email}</p>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-semantic-error hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-[rgb(var(--bg-secondary))] overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
