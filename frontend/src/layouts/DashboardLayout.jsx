import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useLang } from '../contexts/LangContext';
import { getT } from '../utils/translations';

// Map paths to page titles (en/si)
const getPageTitle = (pathname, t) => {
  if (pathname === '/owner') return t('dashboard');
  if (pathname.startsWith('/owner/properties')) return t('myProperties');
  if (pathname.startsWith('/owner/tenants')) return t('tenants');
  if (pathname.startsWith('/owner/costs')) return t('costs');
  if (pathname.startsWith('/owner/payments')) return t('payments');
  if (pathname.startsWith('/owner/key-money')) return t('keyMoney');
  if (pathname.startsWith('/admin')) return t('dashboard');
  return 'BMS';
};

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lang } = useLang();
  const t = getT(lang);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const pageTitle = getPageTitle(location.pathname, t);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border flex items-center justify-between px-4 md:px-6 flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-800 dark:text-white">{pageTitle}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {t('welcome')}, {user?.fullName || user?.email}
              </p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-bms-blue rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bms-mauve to-bms-blue flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-md">
              {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;