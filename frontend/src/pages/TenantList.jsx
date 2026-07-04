import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Search } from 'lucide-react';

const TenantList = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useLang();

  const [tenants, setTenants] = useState([]);
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/tenants/by-place/${id}`)
      .then(res => setTenants(res.data))
      .catch(() => toast.error('Failed to load tenants.'))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = tenants.filter(tn =>
    tn.fullName.toLowerCase().includes(query.toLowerCase()) ||
    tn.room?.roomNumber?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <button onClick={() => navigate(`/owner/property/${id}`)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Property
      </button>

      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Current Tenants</h1>
          <p className="page-sub">{filtered.length} tenant(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
            onClick={() => navigate(`/owner/property/${id}/costs`)}>
            {t('generateBills')}
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/owner/property/${id}/admit-tenant`)}>
            <Plus size={16} /> {t('admitTenant')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: '1.25rem' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" placeholder="Search by name or room…"
          style={{ paddingLeft: '2.25rem' }} value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>{t('loading')}</p>
        ) : (
          <table className="bms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Room</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>No tenants found.</td></tr>
              ) : filtered.map(tenant => (
                <tr key={tenant._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#ca7df9,#724cf9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        {tenant.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{tenant.fullName}</span>
                    </div>
                  </td>
                  <td>Room {tenant.room?.roomNumber || 'N/A'}</td>
                  <td>
                    <span className={`badge ${tenant.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/owner/tenant/${tenant._id}`)}>
                      {t('viewProfile')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TenantList;