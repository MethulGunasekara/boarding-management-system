import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { getT } from '../utils/translations';
import {
  LayoutDashboard, Building2, Users, DoorOpen, Banknote,
  Wallet, Key, LogOut, Sun, Moon, Menu, X, Languages,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const t = getT(lang);

  const ownerNavLinks = [
    { name: t('dashboard'),    path: '/owner',              icon: LayoutDashboard },
    { name: t('myProperties'), path: '/owner/properties',   icon: Building2 },
    { name: t('tenants'),      path: '/owner/tenants',      icon: Users },
    { name: t('costs'),        path: '/owner/costs',        icon: Wallet },
    { name: t('payments'),     path: '/owner/payments',     icon: Banknote },
    { name: t('keyMoney'),     path: '/owner/key-money',    icon: Key },
  ];

  const adminNavLinks = [
    { name: t('dashboard'),        path: '/admin',          icon: LayoutDashboard },
    { name: t('boardingPlaces'),   path: '/admin/places',   icon: Building2 },
    { name: 'Overdue Accounts',    path: '/admin/overdue',  icon: Users },
  ];

  const links = user?.role === 'ADMIN' ? adminNavLinks : ownerNavLinks;

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
    onClose?.();
  };

  const isActive = (path) => {
    if (path === '/owner') return location.pathname === '/owner';
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 sidebar-gradient flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bms-blue to-bms-mauve flex items-center justify-center shadow-lg shadow-bms-blue/40">
              <DoorOpen size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm leading-tight">
              BMS<br />
              <span className="text-bms-mauve font-normal text-xs">Portal</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bms-mauve to-bms-blue flex items-center justify-center text-white text-xs font-bold mb-2">
            {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <p className="text-white text-xs font-semibold truncate">{user?.fullName || 'User'}</p>
          <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-bms-blue/20 text-bms-mauve font-medium">
            {user?.role}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => onClose?.()}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${active
                    ? 'bg-gradient-to-r from-bms-blue to-bms-grape text-white shadow-lg shadow-bms-blue/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon size={17} />
                <span className="flex-1">{link.name}</span>
                {active && <ChevronRight size={14} className="opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3 flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {isDark ? t('lightMode') : t('darkMode')}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Languages size={17} />
            {lang === 'en' ? 'සිංහල' : 'English'}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;