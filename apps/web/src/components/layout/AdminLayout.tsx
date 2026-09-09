import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/features/auth/hooks';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Brands', path: '/admin/brands' },
  { label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-brand-dark text-white flex flex-col">
        <div className="p-4 border-b border-brand-gray">
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
                  : 'text-gray-300 hover:bg-brand-gray hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-gray">
          <p className="text-xs text-gray-400 mb-2">{user?.email}</p>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-brand-muted overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
