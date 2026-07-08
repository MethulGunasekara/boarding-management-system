import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { DoorOpen, CheckCircle, Eye, EyeOff } from 'lucide-react';

const PHONE_REGEX = /^(\+94|0)[0-9]{9}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const OwnerSignup = () => {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { t }     = useLang();

  const [plans,    setPlans]    = useState([]);
  const [selected, setSelected] = useState(params.get('plan') || '');
  const [form, setForm] = useState({
    fullName:  params.get('name')  || '',
    email:     params.get('email') || '',
    phone:     '',
    password:  '',
    confirm:   '',
    googleId:  params.get('googleId') || '',
  });
  const [showPass, setShowPass]   = useState(false);
  const [loading,  setLoading]    = useState(false);
  const isGoogleSignup = !!form.googleId;

  useEffect(() => {
    axiosInstance.get('/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  // Phone validation
  const validatePhone = (p) => !p || PHONE_REGEX.test(p.trim());
  const validateEmail = (e) => EMAIL_REGEX.test(e.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Please select a plan.');
    if (!validateEmail(form.email)) return toast.error('Please enter a valid email address.');
    if (form.phone && !validatePhone(form.phone)) return toast.error('Please enter a valid Sri Lankan phone number (e.g. 0771234567).');
    if (!isGoogleSignup) {
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
      if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const payload = {
        fullName:   form.fullName,
        email:      form.email,
        phoneNumber: form.phone,
        planId:     selected,
        ...(form.googleId ? { googleId: form.googleId } : { password: form.password }),
      };
      const res = await axiosInstance.post('/auth/owner/register', payload);
      login(res.data);
      toast.success(`Welcome to BMS, ${res.data.fullName}!`);
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axiosInstance.post('/auth/owner/google', {
        credential: credentialResponse.credential,
        intent: 'register',
      });
      if (res.data.requiresSignup) {
        setForm(f => ({
          ...f,
          googleId: res.data.googleData.googleId,
          email:    res.data.googleData.email,
          fullName: res.data.googleData.name,
        }));
        toast.success('Google account linked! Please select a plan and complete signup.');
      } else {
        login(res.data);
        toast.success('Welcome back!');
        navigate('/owner/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed.');
    }
  };

  const selectedPlan = plans.find(p => p._id === selected);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#724cf9,#ca7df9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoorOpen size={19} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>BMS — {t('registerOwner')}</span>
        </div>

        {/* Plan selector */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">{t('choosePlan')}</h3>
          {plans.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('plansLoading')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {plans.map(plan => (
                <label key={plan._id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: `2px solid ${selected === plan._id ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: selected === plan._id ? 'rgba(114,76,249,0.05)' : 'transparent', transition: 'all 0.2s',
                }}>
                  <input type="radio" name="plan" value={plan._id} checked={selected === plan._id}
                    onChange={() => setSelected(plan._id)} style={{ accentColor: 'var(--primary)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selected === plan._id ? 'var(--primary)' : 'var(--text-main)' }}>{plan.name}</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {plan.price.toLocaleString()}{t('perMonth')}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {plan.maxBoardingPlaces} {t('property')} · {plan.maxRoomsPerPlace} {t('roomsEach')}
                    </p>
                  </div>
                  {selected === plan._id && <CheckCircle size={18} color="var(--primary)" />}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Account details */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">{t('accountDetails')}</h3>

          {/* Google sign-in option */}
          {!isGoogleSignup ? (
            <>
              <div style={{ 
                marginBottom: '1.25rem', 
                display: 'flex', 
                justifyContent: 'center', 
                width: '100%' 
              }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed.')}
                  containerProps={{ style: { width: '100%', display: 'flex', justifyContent: 'center' } }}
                  width="400" 
                  text="signup_with"
                  shape="rectangular"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('orDivider')}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              </div>
            </>
          ) : (
            <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              ✓ Google account linked: <strong>{form.email}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input type="text" className="form-input" placeholder="Your full name"
                value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                readOnly={isGoogleSignup} style={isGoogleSignup ? { background: 'var(--bg-surface)', cursor: 'default' } : {}}
                required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('phone')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('optional')})</span></label>
              <input type="tel" className="form-input" placeholder="0771234567 or +94771234567"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Sri Lankan format: 07XXXXXXXX or +94XXXXXXXXX</p>
            </div>

            {!isGoogleSignup && (
              <>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">{t('password')}</label>
                  <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters"
                    style={{ paddingRight: '2.5rem' }}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: '0.75rem', top: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">{t('confirmPassword')}</label>
                  <input type="password" className="form-input" placeholder="Re-enter password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                </div>
              </>
            )}

            {selectedPlan && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(114,76,249,0.06)', border: '1px solid rgba(114,76,249,0.2)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                {t('signupNote')} <strong>{selectedPlan.name}</strong> at <strong>Rs. {selectedPlan.price.toLocaleString()}/month</strong>. {t('signupNoteEnd')}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}
              disabled={loading || !selected}>
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {t('alreadyAccount')}{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('signIn')}</Link>
        </p>
      </div>
    </div>
  );
};

export default OwnerSignup;