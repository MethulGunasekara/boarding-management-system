import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { getT } from '../utils/translations';
import { DoorOpen, Mail, Lock, ChevronDown, Sun, Moon, Languages, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'OWNER' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { email, password, role } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const t = getT(lang);

  const { user, isLoading, isError, isSuccess, message } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isError) setErrorMsg(message);
    if (isSuccess || user) {
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'OWNER') navigate('/owner');
      else navigate('/portal');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setErrorMsg('');
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const endpoints = {
      TENANT: '/auth/tenant/login',
      OWNER: '/auth/owner/login',
      ADMIN: '/auth/login',
    };
    dispatch(login({ email, password, roleEndpoint: endpoints[role] }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex transition-colors duration-300">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bms-grape via-bms-blue to-bms-mauve" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #edf67d 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, #f896d8 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-xl">
            <DoorOpen size={28} className="text-bms-lime" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            {lang === 'en' ? 'Boarding Management' : 'නවාතැන් කළමනාකරණය'}
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            {lang === 'en'
              ? 'Manage your boarding house digitally. Tenants, rooms, bills — all in one place.'
              : 'ඔබේ නවාතැන ඩිජිටල් ලෙස කළමනාකරණය කරන්න. කුලී නිවැසියන්, කාමර, බිල් — සියල්ල එකම තැනක.'}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: lang === 'en' ? 'Digital Admission' : 'ඩිජිටල් ඇතුළත් කිරීම', icon: '📋' },
              { label: lang === 'en' ? 'Smart Billing' : 'ස්මාර්ට් බිලිං', icon: '⚡' },
              { label: lang === 'en' ? 'Key Money Tracking' : 'යතුරු මුදල් නිරීක්ෂණය', icon: '🔑' },
              { label: lang === 'en' ? 'Payment Records' : 'ගෙවීම් සටහන', icon: '💳' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium text-white/90">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col">
        {/* Top controls */}
        <div className="flex justify-end gap-2 p-4">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
          >
            <Languages size={14} />
            {lang === 'en' ? 'සිංහල' : 'English'}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bms-blue to-bms-grape flex items-center justify-center shadow-lg">
                <DoorOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">{t('appName')}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('appTagline')}</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('signIn')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t('signInTo')}</p>

            {errorMsg && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="form-label">{t('iAm')}</label>
                <div className="relative">
                  <select
                    name="role"
                    value={role}
                    onChange={onChange}
                    className="input-field appearance-none pr-10"
                  >
                    <option value="OWNER">{t('owner')}</option>
                    <option value="ADMIN">{t('admin')}</option>
                    <option value="TENANT">{t('tenant')}</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label">{t('email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label">{t('password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
                {isLoading ? t('loggingIn') : t('signIn')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-bms-blue dark:text-bms-mauve font-semibold hover:underline">
                {t('registerOwner')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;