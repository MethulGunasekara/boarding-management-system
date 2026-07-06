import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { DoorOpen, CheckCircle, Eye, EyeOff } from 'lucide-react';

const OwnerSignup = () => {
  const [params]    = useSearchParams();
  const planId      = params.get('plan') || '';
  const navigate    = useNavigate();
  const { login }   = useAuth();

  const [plans,    setPlans]    = useState([]);
  const [selected, setSelected] = useState(planId);
  const [form,     setForm]     = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    axiosInstance.get('/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const selectedPlan = plans.find(p => p._id === selected);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Please select a plan.');
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/owner/register', {
        fullName: form.fullName, email: form.email, password: form.password, planId: selected,
      });
      login(res.data);
      toast.success(`Welcome to BMS, ${res.data.fullName}!`);
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#724cf9,#ca7df9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoorOpen size={19} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>BMS — Owner Registration</span>
        </div>

        {/* Plan selector */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">1. Choose Your Plan</h3>
          {plans.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading plans…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {plans.map(plan => (
                <label key={plan._id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: `2px solid ${selected === plan._id ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: selected === plan._id ? 'rgba(114,76,249,0.05)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <input type="radio" name="plan" value={plan._id} checked={selected === plan._id}
                    onChange={() => setSelected(plan._id)} style={{ accentColor: 'var(--primary)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selected === plan._id ? 'var(--primary)' : 'var(--text-main)' }}>{plan.name}</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {plan.price.toLocaleString()}/mo</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {plan.maxBoardingPlaces} property · {plan.maxRoomsPerPlace} rooms each
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
          <h3 className="section-title">2. Your Account Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your full name"
                value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                placeholder="Min. 8 characters" style={{ paddingRight: '2.5rem' }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '0.75rem', top: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Re-enter password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>

            {selectedPlan && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(114,76,249,0.06)', border: '1px solid rgba(114,76,249,0.2)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                You're signing up for <strong>{selectedPlan.name}</strong> at <strong>Rs. {selectedPlan.price.toLocaleString()}/month</strong>. Your first payment will be due in 30 days.
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading || !selected}>
              {loading ? 'Creating Account…' : 'Create My Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default OwnerSignup;