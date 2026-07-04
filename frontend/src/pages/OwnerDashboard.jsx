import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Building2, Plus, ChevronRight } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useLang();
  const navigate = useNavigate();

  const [places,  setPlaces]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/boarding-places/my-places')
      .then(res => setPlaces(res.data))
      .catch(() => toast.error('Failed to load your properties.'))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = places.filter(p => p.subscriptionStatus === 'ACTIVE').length;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">{t('myProperties')}</h1>
          <p className="page-sub">Logged in as {user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/owner/approvals')}>
            ✓ {t('reviewPayments')}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/owner/add-property')}>
            <Plus size={16} /> Add New Property
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Building2 size={20} /></div>
          <div>
            <div className="stat-value">{places.length}</div>
            <div className="stat-label">Total Properties</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><Building2 size={20} /></div>
          <div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
      ) : places.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No properties yet.</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Register your first boarding place to get started.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/owner/add-property')}>
            <Plus size={16} /> Add Property
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {places.map(place => (
            <div
              key={place._id}
              className="card property-card"
              style={{ borderTopColor: place.subscriptionStatus === 'ACTIVE' ? 'var(--success)' : 'var(--danger)', borderTopWidth: 3 }}
              onClick={() => navigate(`/owner/property/${place._id}`)}
            >
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(114,76,249,0.1)', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={19} color="var(--primary)" />
                </div>
                <span className={`badge ${place.subscriptionStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                  {place.subscriptionStatus}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{place.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{place.address}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                Manage <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;