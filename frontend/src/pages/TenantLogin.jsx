import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { DoorOpen, Moon, Sun, Languages, Eye, EyeOff } from 'lucide-react';

// Only import GoogleLogin if a client ID is actually configured
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleEnabled = !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

let GoogleLogin = null;
if (googleEnabled) {
  // Dynamic import to avoid errors when not configured
  try {
    const mod = await import('@react-oauth/google').catch(() => null);
    if (mod) GoogleLogin = mod.GoogleLogin;
  } catch { /* Google not available */ }
}

const TenantLogin = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { login }       = useAuth();
  const { dark, toggle: toggleTheme }   = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/tenant/login', { email, password });
      login(res.data);
      toast.success(`${t('welcomeBack')}, ${res.data.fullName}!`);
      navigate('/tenant/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axiosInstance.post('/auth/tenant/google', {
        credential: credentialResponse.credential,
      });
      login(res.data);
      toast.success(`${t('welcomeBack')}, ${res.data.fullName}!`);
      navigate('/tenant/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', padding: '1.5rem', position: 'relative' }}>

      {/* Controls */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="navbar-btn" onClick={toggleLang}>
          <Languages size={14} />{lang === 'en' ? 'සිං' : 'EN'}
        </button>
        <button className="navbar-btn" onClick={toggleTheme}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#724cf9,#ca7df9)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <DoorOpen size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{t('tenantPortal')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('tenantSignIn')}</p>
        </div>

        <div className="card">
          {/* Google sign-in — only shown when properly configured */}
          {googleEnabled && GoogleLogin && (
            <>
              <div style={{ 
                marginBottom: '1.25rem', 
                display: 'flex', 
                justifyContent: 'center', 
                width: '100%' 
              }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed. Please use email and password.')}
                  containerProps={{ style: { width: '100%' } }} // Scales the implicit internal wrapper element
                  width="400" // Matches your tenant layout's explicit maxWidth dimension
                  text="signin_with"
                  shape="rectangular"
                  theme={dark ? 'filled_black' : 'outline'}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('orDivider')}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              </div>
            </>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <label className="form-label">{t('password')}</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Are you an owner?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Owner / Admin Login →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TenantLogin;