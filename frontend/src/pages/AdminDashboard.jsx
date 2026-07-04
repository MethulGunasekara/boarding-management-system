import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Building2, AlertTriangle, Bell, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t }    = useLang();
  const navigate = useNavigate();

  const [places,        setPlaces]        = useState([]);
  const [overduePlaces, setOverduePlaces] = useState([]);
  const [logs,          setLogs]          = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, o, l] = await Promise.all([
          axiosInstance.get('/admin/boarding-places'),
          axiosInstance.get('/admin/overdue'),
          axiosInstance.get('/notifications/log'),
        ]);
        setPlaces(p.data);
        setOverduePlaces(o.data);
        setLogs(l.data);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Admin Control Center</h1>
          <p className="page-sub">Welcome back, {user?.email}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/add-property')}>
          <Plus size={16} /> {t('addProperty')}
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Building2 size={20} /></div>
          <div>
            <div className="stat-value">{places.length}</div>
            <div className="stat-label">{t('totalProperties')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger"><AlertTriangle size={20} /></div>
          <div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{overduePlaces.length}</div>
            <div className="stat-label">{t('overdueSubscriptions')}</div>
          </div>
        </div>
      </div>

      {/* Overdue alert */}
      {overduePlaces.length > 0 && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <strong>{overduePlaces.length} boarding place(s)</strong> have overdue subscriptions.
        </div>
      )}

      <div className="grid-2">
        {/* Registered Properties */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>{t('registeredProperties')}</h3>
          </div>
          {places.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('noProperties')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {places.map(place => (
                <div key={place._id} style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{place.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{place.address}</p>
                  </div>
                  <span className={`badge ${
                    place.subscriptionStatus === 'ACTIVE'  ? 'badge-success' :
                    place.subscriptionStatus === 'OVERDUE' ? 'badge-danger'  : 'badge-muted'
                  }`}>{place.subscriptionStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification logs */}
        <div className="card">
          <h3 className="section-title">Recent System Logs</h3>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent notifications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {logs.slice(0, 6).map(log => (
                <div key={log._id} style={{ padding: '0.65rem 0.85rem', borderRadius: '0.5rem', background: 'var(--bg-surface)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>[{log.channel}]</span>
                  {' '}{log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;