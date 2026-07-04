import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { DoorOpen, Eye, EyeOff, Moon, Sun, Languages } from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState('OWNER');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const { login }        = useContext(AuthContext);
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = loginType === 'ADMIN' ? '/auth/login' : '/auth/owner/login';
    try {
      const res = await axiosInstance.post(endpoint, { email, password });
      login(res.data);
      toast.success(`Welcome back!`);
      navigate(res.data.role === 'ADMIN' ? '/admin/dashboard' : '/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-base)' }}>
      {/* Left decorative panel */}
      <div style={{
        display: 'none',
        width: '45%',
        background: 'linear-gradient(160deg,#564592 0%,#724cf9 60%,#ca7df9 100%)',
        padding: '3rem',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
      }}
        className="login-panel"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, background: '#edf67d', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoorOpen size={20} color="#564592" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>BMS</span>
        </div>

        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Boarding Management<br />
            <span style={{ color: '#edf67d' }}>Made Simple.</span>
          </h1>
          <p style={{ opacity: 0.75, fontSize: '1rem', lineHeight: 1.7, maxWidth: 320 }}>
            Manage rooms, tenants, and payments — all in one place, built for Sri Lankan boarding houses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['Rooms', 'Payments', 'Utilities', 'Key Money'].map(f => (
            <div key={f} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>

        {/* Top-right controls */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button className="navbar-btn" onClick={toggleLang}>
            <Languages size={14} />
            {lang === 'en' ? 'සිං' : 'EN'}
          </button>
          <button className="navbar-btn" onClick={toggleTheme}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo for mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <div style={{ width: 38, height: 38, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DoorOpen size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{t('bmsPortal')}</span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Sign in to continue</p>

          {/* Role toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '0.75rem' }}>
            {[
              { val: 'OWNER', label: t('boardingOwner') },
              { val: 'ADMIN', label: t('systemAdmin') },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => setLoginType(r.val)}
                style={{
                  padding: '0.55rem',
                  borderRadius: '0.6rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: loginType === r.val ? 'var(--bg-card)' : 'transparent',
                  color: loginType === r.val ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: loginType === r.val ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <label className="form-label">{t('password')}</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '0.75rem', top: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? t('loading') : `${t('signIn')} as ${loginType === 'OWNER' ? t('boardingOwner') : t('systemAdmin')}`}
            </button>
          </form>

          {/* Link to tenant login */}
          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Are you a tenant?{' '}
            <Link to="/tenant/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Tenant Login →
            </Link>
          </p>
        </div>
      </div>

      {/* Show left panel on large screens */}
      <style>{`.login-panel { display: flex !important; } @media(max-width:768px){ .login-panel { display: none !important; } }`}</style>
    </div>
  );
};

export default Login;