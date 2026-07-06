import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { ArrowLeft, CreditCard, AlertTriangle, CheckCircle, Calendar, Plus, X } from 'lucide-react';

// ── Rent Records Table ──────────────────────────────────────────────────
const RentRecordsTable = ({ tenantId, monthlyRent, admissionDate }) => {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  // Form for adding a future month
  const [addForm, setAddForm]     = useState({ monthKey: '', monthName: '', dueDate: '' });

  const load = useCallback(() => {
    axiosInstance.get(`/rent-records/${tenantId}`)
      .then(r => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (recordId) => {
    setSaving(recordId);
    try {
      const updated = await axiosInstance.patch(`/rent-records/${recordId}/pay`);
      setRecords(updated.data); // backend returns full updated list
      toast.success('Marked as paid. Next month record auto-generated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    } finally { setSaving(null); }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/rent-records', {
        tenantId,
        monthName: addForm.monthName,
        monthKey:  addForm.monthKey,
        amountDue: monthlyRent,
        dueDate:   addForm.dueDate,
      });
      toast.success('Rent record added.');
      setShowAdd(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    }
  };

  // When user picks a due date, auto-fill month name and key
  const handleDueDateChange = (dateStr) => {
    if (!dateStr) { setAddForm({ monthKey: '', monthName: '', dueDate: '' }); return; }
    const d = new Date(dateStr);
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const name = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    setAddForm({ monthKey: key, monthName: name, dueDate: dateStr });
  };

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <Calendar size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Monthly Rent Records
        </h3>
        <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Pre-record Payment</>}
        </button>
      </div>

      {/* Add future record form */}
      {showAdd && (
        <form onSubmit={handleAddRecord} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Payment Due Date</label>
            <input type="date" className="form-input" style={{ width: 170 }}
              value={addForm.dueDate} onChange={e => handleDueDateChange(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Month</label>
            <input type="text" className="form-input" value={addForm.monthName} readOnly placeholder="Auto-filled from date" style={{ background: 'var(--bg-card)', cursor: 'default' }} />
          </div>
          <div>
            <label className="form-label">Amount (Rs.)</label>
            <input type="number" className="form-input" style={{ width: 120 }} value={monthlyRent} readOnly style={{ background: 'var(--bg-card)', cursor: 'default', width: 120 }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Add Record</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading rent records…</p>
      ) : records.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No rent records yet. Records are auto-generated monthly, or you can pre-record one above.
        </p>
      ) : (
        <table className="bms-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map(rec => (
              <tr key={rec._id}>
                <td style={{ fontWeight: 600 }}>{rec.monthName}</td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(rec.dueDate).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>Rs. {rec.amountDue.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    rec.status === 'PAID'    ? 'badge-success' :
                    rec.status === 'OVERDUE' ? 'badge-danger'  : 'badge-warning'
                  }`}>{rec.status}</span>
                  {/* Pre-payment indicator */}
                  {rec.status === 'PAID' && rec.paidOn && new Date(rec.paidOn) < new Date(rec.dueDate) && (
                    <span className="badge badge-primary" style={{ marginLeft: '0.4rem' }}>Pre-paid</span>
                  )}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {rec.paidOn ? new Date(rec.paidOn).toLocaleDateString() : '—'}
                </td>
                <td>
                  {rec.status !== 'PAID' && (
                    <button
                      className="btn btn-success btn-sm"
                      disabled={saving === rec._id}
                      onClick={() => markPaid(rec._id)}
                    >
                      {saving === rec._id ? '…' : <><CheckCircle size={13} /> Mark Paid</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Main TenantProfile ──────────────────────────────────────────────────
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
    } finally { setLoading(false); }
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
                {charges.totalDue > 0 && <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={11} /> Overdue</span>}
              </div>
              {charges.totalDue > 0 && (
                <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--danger)' }}>Rs. {charges.totalDue} outstanding</p>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Personal Info</h4>
              {[
                ['NIC',     tenant.nicNumber],
                ['Email',   tenant.email],
                ['Contact', tenant.contactNumber],
                ['Address', tenant.address],
                ['Course',  tenant.courseOrWorkplace],
                ['Monthly Rent', `Rs. ${tenant.monthlyRent || tenant.rentAmount || '—'}`],
              ].map(([label, val]) => (
                <p key={label} style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <strong style={{ color: 'var(--text-muted)', marginRight: '0.3rem' }}>{label}:</strong>{val}
                </p>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Tenancy</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}><strong style={{ color: 'var(--text-muted)' }}>Room:</strong> Room {tenant.room?.roomNumber}</p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}><strong style={{ color: 'var(--text-muted)' }}>Admitted:</strong> {new Date(tenant.admissionDate).toLocaleDateString()}</p>
              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Emergency</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}><strong style={{ color: 'var(--text-muted)' }}>Name:</strong> {tenant.emergencyContact?.name}</p>
              <p style={{ fontSize: '0.875rem' }}><strong style={{ color: 'var(--text-muted)' }}>Number:</strong> {tenant.emergencyContact?.number}</p>
            </div>
          </div>
        </div>

        {/* ── RENT RECORDS TABLE (Issue 4) ── */}
        <RentRecordsTable
          tenantId={id}
          monthlyRent={tenant.monthlyRent || tenant.rentAmount || 0}
          admissionDate={tenant.admissionDate}
        />

        {/* Charge history */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Shared Bill Charges</h3>
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

          {charges.charges.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No shared-bill charges recorded yet.</p>
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
            <button onClick={handleMoveOut} className="btn btn-danger">{t('moveOut')}</button>
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