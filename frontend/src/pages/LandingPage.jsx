import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { DoorOpen, CheckCircle, Building2, Users, Zap, CreditCard, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';

const LandingPage = () => {
  const [plans,   setPlans]   = useState([]);
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang }  = useLang();

  useEffect(() => {
    axiosInstance.get('/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const features = [
    { icon: Building2, title: 'Multi-Property Management', desc: 'Manage multiple boarding houses under one account. Track rooms, tenants, and payments across all your properties.' },
    { icon: Users,     title: 'Digital Tenant Admission', desc: 'Paperless admission forms with ID photo upload and digital signature. All tenant records stored securely in the cloud.' },
    { icon: Zap,       title: 'Smart Bill Splitting',     desc: 'Split electricity and water bills evenly, by custom percentage, or by exact amounts — you decide how to divide costs.' },
    { icon: CreditCard,title: 'Payment Tracking',         desc: 'Track rent payments, key money deposits, and shared costs. Owners approve receipts, tenants get reminders automatically.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)' }}>

      {/* ── Sticky Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#724cf9,#ca7df9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoorOpen size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>BMS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="navbar-btn" onClick={toggleLang}>
            <Languages size={14} /> {lang === 'en' ? 'සිං' : 'EN'}
          </button>
          <button className="navbar-btn" onClick={toggleTheme}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/tenant/login" className="btn btn-outline btn-sm">Tenant Login</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Owner Login</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg,#564592 0%,#724cf9 50%,#ca7df9 100%)',
        padding: '6rem 2rem 5rem', textAlign: 'center', color: '#fff',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.35rem 1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            🏠 Built for Sri Lankan Boarding Houses
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Manage Your Boarding House<br />
            <span style={{ color: '#edf67d' }}>Like a Pro</span>
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            Digital admissions, smart bill splitting, payment tracking, and SMS reminders — everything you need to run a boarding house without the paperwork.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#plans" className="btn" style={{ background: '#edf67d', color: '#564592', fontWeight: 700, padding: '0.8rem 2rem', fontSize: '1rem' }}>
              View Plans & Pricing
            </a>
            <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Owner Login →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>One platform to manage every aspect of your boarding house.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(114,76,249,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <f.icon size={22} color="var(--primary)" />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" style={{ padding: '5rem 2rem', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Simple, Transparent Pricing</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Choose the plan that fits your boarding house. Cancel anytime.</p>

          {plans.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Plans coming soon. Contact admin for details.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {plans.map((plan, i) => (
                <div key={plan._id} className="card" style={{
                  padding: '2rem', position: 'relative', overflow: 'hidden',
                  border: i === 1 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                }}>
                  {i === 1 && (
                    <div style={{ position: 'absolute', top: 16, right: -28, background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 2.5rem', transform: 'rotate(45deg)' }}>
                      POPULAR
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>Rs. {plan.price.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/month</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Up to <strong>{plan.maxBoardingPlaces}</strong> boarding place(s) · <strong>{plan.maxRoomsPerPlace}</strong> rooms each
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(plan.features || []).map((feat, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <CheckCircle size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/signup?plan=${plan._id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', background: i === 1 ? 'var(--primary)' : undefined }}
                  >
                    Get Started →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ color: 'var(--primary)' }}>Owner Login</Link>
          <Link to="/tenant/login" style={{ color: 'var(--primary)' }}>Tenant Login</Link>
        </div>
        <p>© {new Date().getFullYear()} BMS — Boarding Management System</p>
      </footer>
    </div>
  );
};

export default LandingPage;