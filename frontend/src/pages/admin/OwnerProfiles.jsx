import { useState, useEffect } from 'react';
import { useLang } from '../../context/LangContext';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { ChevronRight, AlertTriangle, CheckCircle, Users } from 'lucide-react';

// ── Owner Detail Panel (shown inline when a row is clicked) ──────────────
const OwnerDetail = ({ ownerId, plans, onClose, onRefresh }) => {
  const { t }   = useLang();
  const [data,  setData]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null); // id of row being saved

  const load = () => {
    setLoading(true);
    axiosInstance.get(`/admin/owners/${ownerId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load owner details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [ownerId]);

  const markPaid = async (subId) => {
    setSaving(subId);
    try {
      await axiosInstance.patch(`/admin/owner-subscriptions/${subId}/pay`);
      toast.success('Marked as paid. Next month record generated.');
      load(); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(null); }
  };

  const changePlan = async (planId) => {
    try {
      await axiosInstance.patch(`/admin/owners/${ownerId}/plan`, { planId });
      toast.success('Plan updated'); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const changeStatus = async (status) => {
    try {
      await axiosInstance.patch(`/admin/owners/${ownerId}/status`, { status });
      toast.success('Status updated'); load(); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  if (!data)   return null;

  const { owner, subscriptions } = data;
  const isOverdue = owner.nextPaymentDue && new Date() > new Date(owner.nextPaymentDue) && owner.ownerSubscriptionStatus !== 'INACTIVE';

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-card)', padding: '1.5rem', marginTop: '0.75rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 800 }}>{owner.fullName}</h3>
            <span className={`badge ${
              owner.ownerSubscriptionStatus === 'ACTIVE'   ? 'badge-success' :
              owner.ownerSubscriptionStatus === 'OVERDUE'  ? 'badge-danger'  : 'badge-muted'
            }`}>{owner.ownerSubscriptionStatus}</span>
            {isOverdue && <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={10} /> Payment Overdue</span>}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{owner.email}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
            Plan: <strong>{owner.plan?.name || 'None'}</strong> · Next due: <strong>{owner.nextPaymentDue ? new Date(owner.nextPaymentDue).toLocaleDateString() : '—'}</strong>
          </p>
        </div>
        <button onClick={onClose} className="btn btn-outline btn-sm">Close</button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <label className="form-label">Change Plan</label>
          <select className="form-input" style={{ width: 'auto' }} value={owner.plan?._id || ''} onChange={e => changePlan(e.target.value)}>
            <option value="" disabled>-- Select --</option>
            {plans.map(p => <option key={p._id} value={p._id}>{p.name} (Rs.{p.price}/mo)</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Account Status</label>
          <select className="form-input" style={{ width: 'auto' }} value={owner.ownerSubscriptionStatus} onChange={e => changeStatus(e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="OVERDUE">Overdue</option>
            <option value="INACTIVE">Inactive (Deactivated)</option>
          </select>
        </div>
      </div>

      {/* Subscription payment table */}
      <h4 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
        Monthly Subscription History
      </h4>
      {subscriptions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No subscription records yet.</p>
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
            {subscriptions.map(sub => (
              <tr key={sub._id}>
                <td style={{ fontWeight: 600 }}>{sub.monthName}</td>
                <td>{new Date(sub.dueDate).toLocaleDateString()}</td>
                <td>Rs. {sub.amountDue.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    sub.status === 'PAID'    ? 'badge-success' :
                    sub.status === 'OVERDUE' ? 'badge-danger'  : 'badge-warning'
                  }`}>{sub.status}</span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {sub.paidOn ? new Date(sub.paidOn).toLocaleDateString() : '—'}
                </td>
                <td>
                  {sub.status !== 'PAID' && (
                    <button className="btn btn-success btn-sm" disabled={saving === sub._id} onClick={() => markPaid(sub._id)}>
                      {saving === sub._id ? '…' : <><CheckCircle size={13} /> Mark Paid</>}
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

// ── Main page ────────────────────────────────────────────────────────────
const OwnerProfiles = () => {
  const { t }       = useLang();
  const [owners,    setOwners]    = useState([]);
  const [plans,     setPlans]     = useState([]);
  const [expanded,  setExpanded]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  const loadOwners = () => {
    axiosInstance.get('/admin/owners')
      .then(r => setOwners(r.data))
      .catch(() => toast.error('Failed to load owners'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOwners();
    axiosInstance.get('/plans/all').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const activeCount  = owners.filter(o => o.ownerSubscriptionStatus === 'ACTIVE').length;
  const overdueCount = owners.filter(o => o.isPaymentOverdue).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Boarding Owner Accounts</h1>
        <p className="page-sub">Manage subscriptions, plans, and payment status for all registered owners</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Users size={20} /></div>
          <div><div className="stat-value">{owners.length}</div><div className="stat-label">Total Owners</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><CheckCircle size={20} /></div>
          <div><div className="stat-value">{activeCount}</div><div className="stat-label">Active</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger"><AlertTriangle size={20} /></div>
          <div><div className="stat-value" style={{ color: 'var(--danger)' }}>{overdueCount}</div><div className="stat-label">Payment Overdue</div></div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="bms-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Next Payment</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {owners.map(owner => (
                <>
                  <tr key={owner._id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === owner._id ? null : owner._id)}>
                    <td>
                      <p style={{ fontWeight: 600 }}>{owner.fullName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{owner.email}</p>
                    </td>
                    <td>{owner.plan?.name || <span style={{ color: 'var(--text-muted)' }}>No plan</span>}</td>
                    <td>
                      <span className={`badge ${
                        owner.ownerSubscriptionStatus === 'ACTIVE'   ? 'badge-success' :
                        owner.ownerSubscriptionStatus === 'OVERDUE'  ? 'badge-danger'  : 'badge-muted'
                      }`}>{owner.ownerSubscriptionStatus}</span>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {owner.nextPaymentDue ? new Date(owner.nextPaymentDue).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {owner.isPaymentOverdue
                        ? <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}><AlertTriangle size={10} /> Overdue</span>
                        : <span className="badge badge-success">On Time</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)', transform: expanded === owner._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </td>
                  </tr>
                  {expanded === owner._id && (
                    <tr key={`${owner._id}-detail`}>
                      <td colSpan={6} style={{ padding: '0 1rem 1rem' }}>
                        <OwnerDetail ownerId={owner._id} plans={plans} onClose={() => setExpanded(null)} onRefresh={loadOwners} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {owners.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No owners registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerProfiles;