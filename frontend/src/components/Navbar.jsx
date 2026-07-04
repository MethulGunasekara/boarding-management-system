import { useState } from 'react';
import { Menu, Moon, Sun, Languages, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import Sidebar from './Sidebar';

const Navbar = () => {
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="bms-navbar">
        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Controls */}
        <div className="navbar-controls">
          <button
            className="navbar-btn"
            onClick={toggleLang}
            title={t('language')}
          >
            <Languages size={15} />
            <span>{lang === 'en' ? 'සිං' : 'EN'}</span>
          </button>

          <button
            className="navbar-btn"
            onClick={toggleTheme}
            title={dark ? t('lightMode') : t('darkMode')}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div
            className="sidebar-drawer"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="sidebar-drawer-close"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;