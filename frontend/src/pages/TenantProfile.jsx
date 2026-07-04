import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { ArrowLeft, CreditCard, AlertTriangle } from 'lucide-react';

const TenantProfile = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useLang();

  const [tenant,  setTenant]  = useState(null);
  const [charges, setCharges] = useState({ charges: [], totalDue: 0 });
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedChargeId,   setSelectedChargeId]   = useState(null);

  const fetchTenantData = async () => {
    try {
      const [tenantRes, chargesRes] = await Promise.all([
        axiosInstance.get(`/tenants/${id}`),
        axiosInstance.get(`/tenants/${id}/charges`),
      ]);
      setTenant(tenantRes.data);
      setCharges(chargesRes.data);
    } catch {
      toast.error('Failed to load tenant details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenantData(); }, [id]);

  const handleMoveOut = async () => {
    if (!window.confirm('Are you sure? This will void all pending charges.')) return;
    try {
      await axiosInstance.patch(`/tenants/${id}/move-out`);
      toast.success('Tenant successfully moved out.');
      setTenant(prev => ({ ...prev, status: 'MOVED_OUT' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process move out.');
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;
  if (!tenant) return <p>Tenant not found.</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> {t('back')}
      </button>

      <div className="profile-grid">
        {/* Profile card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#ca7df9,#724cf9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 }}>
              {tenant.fullName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tenant.fullName}</h2>
                <span className={`badge ${tenant.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>{tenant.status}</span>
                {charges.totalDue > 0 && (
                  <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={11} /> Overdue
                  </span>
                )}
              </div>
              {charges.totalDue > 0 && (
                <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--danger)' }}>
                  Rs. {charges.totalDue} outstanding
                </p>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                Personal Info
              </h4>
              {[
                ['NIC',      tenant.nicNumber],
                ['Email',    tenant.email],
                ['Contact',  tenant.contactNumber],
                ['Address',  tenant.address],
                ['Course',   tenant.courseOrWorkplace],
                ['Rent',     `Rs. ${tenant.monthlyRent}`],
              ].map(([label, val]) => (
                <p key={label} style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <strong style={{ color: 'var(--text-muted)', marginRight: '0.3rem' }}>{label}:</strong>{val}
                </p>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                Tenancy
              </h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}><strong style={{ color: 'var(--text-muted)' }}>Room:</strong> Room {tenant.room?.roomNumber}</p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}><strong style={{ color: 'var(--text-muted)' }}>Admitted:</strong> {new Date(tenant.admissionDate).toLocaleDateString()}</p>

              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                Emergency Contact
              </h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}><strong style={{ color: 'var(--text-muted)' }}>Name:</strong> {tenant.emergencyContact?.name}</p>
              <p style={{ fontSize: '0.875rem' }}><strong style={{ color: 'var(--text-muted)' }}>Number:</strong> {tenant.emergencyContact?.number}</p>
            </div>
          </div>
        </div>

        {/* Charges & payment */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Financial Summary</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Outstanding</p>
                <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--danger)' }}>Rs. {charges.totalDue}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setSelectedChargeId(null); setIsPaymentModalOpen(true); }}>
                <CreditCard size={14} /> {t('recordPayment')}
              </button>
            </div>
          </div>

          <h4 style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Charge History
          </h4>

          {charges.charges.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No charges recorded yet.</p>
          ) : (
            <table className="bms-table">
              <thead>
                <tr>
                  <th>Date Due</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {charges.charges.map(charge => (
                  <tr key={charge._id}>
                    <td>{new Date(charge.dueDate).toLocaleDateString()}</td>
                    <td>{charge.type === 'RENT' ? 'Monthly Rent' : charge.costReference?.title || 'Shared Bill'}</td>
                    <td>
                      <span className={`badge ${
                        charge.status === 'PENDING'      ? 'badge-warning' :
                        charge.status === 'PAID'         ? 'badge-success' :
                        charge.status === 'UNDER_REVIEW' ? 'badge-info'    : 'badge-muted'
                      }`}>{charge.status.replace('_', ' ')}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>Rs. {charge.amountDue}</td>
                    <td>
                      {charge.status === 'PENDING' && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedChargeId(charge._id); setIsPaymentModalOpen(true); }}>
                          Pay This
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Documents */}
        <div className="card">
          <h3 className="section-title">Documents</h3>
          <div className="doc-grid">
            {[tenant.idFrontImageUrl, tenant.idBackImageUrl, tenant.signatureImageUrl]
              .filter(Boolean)
              .map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={['ID Front','ID Back','Signature'][i]} style={{ width: '100%' }} />
                </a>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="section-title">Actions</h3>
          {tenant.status === 'ACTIVE' && (
            <button onClick={handleMoveOut} className="btn btn-danger">
              {t('moveOut')}
            </button>
          )}
        </div>
      </div>

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setSelectedChargeId(null); }}
        tenantId={id}
        chargeLineId={selectedChargeId}
        onSuccess={fetchTenantData}
      />
    </div>
  );
};

export default TenantProfile;