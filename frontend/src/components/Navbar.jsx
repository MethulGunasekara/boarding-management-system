import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, Languages, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Sidebar from './Sidebar';

const Navbar = () => {
  const { dark, toggle: toggleTheme }   = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen,      setBellOpen]      = useState(false);

  const unread = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    const fetch = () =>
      axiosInstance.get('/notifications/registrations')
        .then(r => setNotifications(r.data))
        .catch(() => {});
    fetch();
    const timer = setInterval(fetch, 60000);
    return () => clearInterval(timer);
  }, [user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await axiosInstance.patch(`/notifications/${notif._id}/read`).catch(() => {});
      setNotifications(prev =>
        prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
      );
    }
    setBellOpen(false);
    if (notif.relatedId) navigate(`/admin/owners?open=${notif.relatedId}`);
  };

  const markAllRead = async () => {
    await Promise.all(
      notifications
        .filter(n => !n.isRead)
        .map(n => axiosInstance.patch(`/notifications/${n._id}/read`))
    ).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <>
      <header className="bms-navbar">
        <button className="navbar-hamburger" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>

        <div style={{ flex: 1 }} />

        <div className="navbar-controls">
          {/* Bell — admin only */}
          {user?.role === 'ADMIN' && (
            <div style={{ position: 'relative' }}>
              <button
                className="navbar-btn"
                onClick={() => setBellOpen(o => !o)}
                title={t('notifications')}
                style={{ position: 'relative' }}
              >
                <Bell size={17} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: 'var(--danger)', color: '#fff',
                    fontSize: '0.6rem', fontWeight: 800,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, width: 320,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                  zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('notifications')}</span>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        {t('markAllRead')}
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                        {t('noNotifications')}
                      </p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '0.85rem 1rem',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            background: n.isRead ? 'transparent' : 'rgba(114,76,249,0.04)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e  => e.currentTarget.style.background = 'var(--bg-surface)'}
                          onMouseLeave={e  => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(114,76,249,0.04)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {!n.isRead && (
                              <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: 'var(--primary)', flexShrink: 0, marginTop: 5,
                              }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.8rem', fontWeight: n.isRead ? 400 : 600, color: 'var(--text-main)', marginBottom: '0.2rem', lineHeight: 1.4 }}>
                                {n.message}
                              </p>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {new Date(n.sentAt).toLocaleString()} · {t('viewOwner')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language toggle */}
          <button className="navbar-btn" onClick={toggleLang} title={t('language')}>
            <Languages size={15} />
            <span>{lang === 'en' ? 'සිං' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button className="navbar-btn" onClick={toggleTheme} title={dark ? t('lightMode') : t('darkMode')}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Backdrop closes bell dropdown */}
      {bellOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setBellOpen(false)}
        />
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar-drawer" onClick={e => e.stopPropagation()}>
            <button className="sidebar-drawer-close" onClick={() => setSidebarOpen(false)}>
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