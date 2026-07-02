import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { getT } from '../utils/translations';
import { DoorOpen, Mail, Lock, User, Phone, Eye, EyeOff, Sun, Moon, Languages } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', contactNumber: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { fullName, email, contactNumber, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const t = getT(lang);

  const { user, isLoading, isError, isSuccess, message } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isError) setErrorMsg(message);
    if (isSuccess || user) navigate('/owner');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setErrorMsg('');
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setErrorMsg(lang === 'en' ? 'Passwords do not match.' : 'මුරපද ගැලපෙන්නේ නැත.');
    }
    dispatch(register({ fullName, email, contactNumber, password }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col transition-colors duration-300">
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
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bms-blue to-bms-grape flex items-center justify-center shadow-lg">
              <DoorOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">{t('appName')}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('appTagline')}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('registerOwner')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {lang === 'en'
              ? 'Create your owner account to start managing your boarding house.'
              : 'ඔබේ නවාතැන කළමනාකරණය කිරීමට ඔබේ හිමිකරු ගිණුම සාදන්න.'}
          </p>

          {errorMsg && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm animate-fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="form-label">{t('fullName')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" name="fullName" value={fullName} onChange={onChange} required
                  placeholder={lang === 'en' ? 'Your full name' : 'ඔබේ සම්පූර්ණ නම'}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">{t('email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" value={email} onChange={onChange} required
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="form-label">{t('contactNumber')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel" name="contactNumber" value={contactNumber} onChange={onChange} required
                  placeholder="07X XXX XXXX"
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
                  type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={onChange} required
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">{t('confirmPassword')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} name="confirmPassword" value={confirmPassword} onChange={onChange} required
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? t('registering') : t('register')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/" className="text-bms-blue dark:text-bms-mauve font-semibold hover:underline">
              {t('loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;